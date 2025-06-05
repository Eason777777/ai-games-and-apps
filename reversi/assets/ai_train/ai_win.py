# -*- coding: utf-8 -*-
"""
黑白棋 (Reversi) AI 訓練主腳本
將 Jupyter Notebook 內容重構為結構清晰的 Python 腳本
"""
import os
import sys
import json
import pickle
import datetime
import random
import math
from pathlib import Path
from collections import defaultdict
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

# =====================
# 1. 環境設置與 checkpoint 目錄
# =====================

IN_COLAB = False
try:
    import google.colab
    IN_COLAB = True
    from google.colab import drive
    drive.mount('/content/drive')
    CHECKPOINT_DIR = '/content/drive/MyDrive/reversi_checkpoints/'
except ImportError:
    CHECKPOINT_DIR = './checkpoints/'
os.makedirs(CHECKPOINT_DIR, exist_ok=True)

# =====================
# 2. Checkpoint 管理類
# =====================


class CheckpointManager:
    """管理訓練過程中的checkpoint保存和載入"""

    def __init__(self, checkpoint_dir):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

    def save_checkpoint(self, model, optimizer, iteration, total_iterations, training_history, metadata=None):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        checkpoint_name = f"checkpoint_iter_{iteration:03d}_{timestamp}.pt"
        checkpoint_path = self.checkpoint_dir / checkpoint_name
        checkpoint_data = {
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'iteration': iteration,
            'total_iterations': total_iterations,
            'training_history': training_history,
            'timestamp': timestamp,
            'metadata': metadata or {}
        }
        torch.save(checkpoint_data, checkpoint_path)
        latest_path = self.checkpoint_dir / "latest_checkpoint.pt"
        torch.save(checkpoint_data, latest_path)
        history_path = self.checkpoint_dir / \
            f"history_iter_{iteration:03d}.pkl"
        with open(history_path, 'wb') as f:
            pickle.dump(training_history, f)
        print(f"💾 Checkpoint 已保存: {checkpoint_name}")
        return checkpoint_path

    def load_latest_checkpoint(self, model, optimizer):
        latest_path = self.checkpoint_dir / "latest_checkpoint.pt"
        if not latest_path.exists():
            print("📭 未找到checkpoint，將從頭開始訓練")
            return None
        try:
            checkpoint = torch.load(latest_path, map_location=device)
            model.load_state_dict(checkpoint['model_state_dict'])
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            print(
                f"📥 已載入checkpoint: 迭代 {checkpoint['iteration']}/{checkpoint['total_iterations']}")
            print(f"📅 保存時間: {checkpoint['timestamp']}")
            return checkpoint
        except Exception as e:
            print(f"❌ 載入checkpoint失敗: {e}")
            return None

    def list_checkpoints(self):
        checkpoint_files = list(
            self.checkpoint_dir.glob("checkpoint_iter_*.pt"))
        checkpoint_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        return checkpoint_files

    def clean_old_checkpoints(self, keep_count=5):
        checkpoint_files = self.list_checkpoints()
        if len(checkpoint_files) > keep_count:
            files_to_delete = checkpoint_files[keep_count:]
            for file_path in files_to_delete:
                try:
                    os.remove(file_path)
                    history_file = file_path.parent / \
                        file_path.name.replace("checkpoint_", "history_")
                    if history_file.exists():
                        os.remove(history_file)
                    print(f"🗑️  已清理舊checkpoint: {file_path.name}")
                except Exception as e:
                    print(f"⚠️  清理checkpoint失敗 {file_path.name}: {e}")

    def get_checkpoint_info(self):
        latest_path = self.checkpoint_dir / "latest_checkpoint.pt"
        if not latest_path.exists():
            return None
        try:
            checkpoint = torch.load(latest_path, map_location='cpu')
            return {
                'iteration': checkpoint['iteration'],
                'total_iterations': checkpoint['total_iterations'],
                'timestamp': checkpoint['timestamp'],
                'metadata': checkpoint.get('metadata', {}),
                'training_history': checkpoint.get('training_history', {})
            }
        except Exception as e:
            print(f"❌ 讀取checkpoint信息失敗: {e}")
            return None


checkpoint_manager = CheckpointManager(CHECKPOINT_DIR)

# =====================
# 3. 黑白棋遊戲邏輯
# =====================


class ReversiGame:
    def __init__(self):
        self.board = np.zeros((8, 8), dtype=np.int32)
        self.board[3][3] = 2
        self.board[3][4] = 1
        self.board[4][3] = 1
        self.board[4][4] = 2
        self.current_player = 1
        self.game_over = False
        self.directions = [(-1, -1), (-1, 0), (-1, 1),
                           (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    def clone(self):
        new_game = ReversiGame()
        new_game.board = self.board.copy()
        new_game.current_player = self.current_player
        new_game.game_over = self.game_over
        return new_game

    def is_valid_move(self, row, col):
        if self.board[row][col] != 0:
            return False
        opponent = 3 - self.current_player
        for dr, dc in self.directions:
            r, c = row + dr, col + dc
            if 0 <= r < 8 and 0 <= c < 8 and self.board[r][c] == opponent:
                r, c = r + dr, c + dc
                while 0 <= r < 8 and 0 <= c < 8:
                    if self.board[r][c] == 0:
                        break
                    if self.board[r][c] == self.current_player:
                        return True
                    r, c = r + dr, c + dc
        return False

    def get_valid_moves(self):
        valid_moves = []
        for row in range(8):
            for col in range(8):
                if self.is_valid_move(row, col):
                    valid_moves.append((row, col))
        return valid_moves

    def make_move(self, row, col):
        if not self.is_valid_move(row, col):
            return False
        self.board[row][col] = self.current_player
        opponent = 3 - self.current_player
        for dr, dc in self.directions:
            pieces_to_flip = []
            r, c = row + dr, col + dc
            while 0 <= r < 8 and 0 <= c < 8 and self.board[r][c] == opponent:
                pieces_to_flip.append((r, c))
                r, c = r + dr, c + dc
                if 0 <= r < 8 and 0 <= c < 8 and self.board[r][c] == self.current_player:
                    for flip_r, flip_c in pieces_to_flip:
                        self.board[flip_r][flip_c] = self.current_player
                    break
        self.current_player = opponent
        if not self.get_valid_moves():
            self.current_player = 3 - self.current_player
            if not self.get_valid_moves():
                self.game_over = True
        return True

    def get_score(self):
        black_count = np.sum(self.board == 1)
        white_count = np.sum(self.board == 2)
        return black_count, white_count

    def get_winner(self):
        black_count, white_count = self.get_score()
        if black_count > white_count:
            return 1
        elif white_count > black_count:
            return 2
        else:
            return 0

    def print_board(self):
        symbols = {0: '.', 1: '●', 2: '○'}
        print('  0 1 2 3 4 5 6 7')
        for i in range(8):
            row_str = f"{i} "
            for j in range(8):
                row_str += symbols[self.board[i][j]] + ' '
            print(row_str)
        black, white = self.get_score()
        print(f"黑棋: {black}, 白棋: {white}")
        print(f"當前玩家: {'黑' if self.current_player == 1 else '白'}")

# =====================
# 4. 神經網路模型
# =====================


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class ReversiNet(nn.Module):
    def __init__(self):
        super(ReversiNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(128, 128, kernel_size=3, padding=1)
        self.residual1 = nn.Sequential(
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128)
        )
        self.residual2 = nn.Sequential(
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128)
        )
        self.policy_conv = nn.Conv2d(128, 32, kernel_size=1)
        self.policy_fc = nn.Linear(32 * 8 * 8, 64)
        self.value_conv = nn.Conv2d(128, 32, kernel_size=1)
        self.value_fc1 = nn.Linear(32 * 8 * 8, 64)
        self.value_fc2 = nn.Linear(64, 1)
        self.bn1 = nn.BatchNorm2d(64)
        self.bn2 = nn.BatchNorm2d(128)
        self.bn3 = nn.BatchNorm2d(128)
        self.bn_policy = nn.BatchNorm2d(32)
        self.bn_value = nn.BatchNorm2d(32)

    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))
        x_res = x
        x = F.relu(x + self.residual1(x_res))
        x_res = x
        x = F.relu(x + self.residual2(x_res))
        policy = F.relu(self.bn_policy(self.policy_conv(x)))
        policy = policy.view(-1, 32 * 8 * 8)
        policy = self.policy_fc(policy)
        value = F.relu(self.bn_value(self.value_conv(x)))
        value = value.view(-1, 32 * 8 * 8)
        value = F.relu(self.value_fc1(value))
        value = torch.tanh(self.value_fc2(value))
        return policy, value

# =====================
# 5. MCTS 蒙地卡羅樹搜索
# =====================


class MCTSNode:
    def __init__(self, game, parent=None, move=None):
        self.game = game
        self.parent = parent
        self.move = move
        self.children = {}
        self.visits = 0
        self.value = 0.0
        self.untried_moves = game.get_valid_moves()

    def select_child(self, c_param=1.4):
        return max(self.children.values(), key=lambda node: node.value / (node.visits + 1e-8) + c_param * math.sqrt(2 * math.log(self.visits + 1) / (node.visits + 1e-8)))

    def expand(self):
        row, col = self.untried_moves.pop()
        next_game = self.game.clone()
        next_game.make_move(row, col)
        child_node = MCTSNode(next_game, parent=self, move=(row, col))
        self.children[(row, col)] = child_node
        return child_node

    def is_fully_expanded(self):
        return len(self.untried_moves) == 0

    def is_terminal(self):
        return self.game.game_over

    def rollout(self, model=None):
        sim_game = self.game.clone()
        if model is not None and not sim_game.game_over:
            while not sim_game.game_over:
                valid_moves = sim_game.get_valid_moves()
                if not valid_moves:
                    sim_game.current_player = 3 - sim_game.current_player
                    valid_moves = sim_game.get_valid_moves()
                    if not valid_moves:
                        sim_game.game_over = True
                        break
                    continue
                board_tensor = self.prepare_input(sim_game)
                policy, _ = model(board_tensor)
                move_probs = torch.zeros(64)
                for row, col in valid_moves:
                    move_probs[row * 8 + col] = policy[0, row * 8 + col].item()
                move_probs = F.softmax(move_probs, dim=0)
                move_idx = torch.multinomial(move_probs, 1).item()
                row, col = move_idx // 8, move_idx % 8
                if (row, col) in valid_moves:
                    sim_game.make_move(row, col)
                else:
                    row, col = random.choice(valid_moves)
                    sim_game.make_move(row, col)
        else:
            while not sim_game.game_over:
                valid_moves = sim_game.get_valid_moves()
                if not valid_moves:
                    sim_game.current_player = 3 - sim_game.current_player
                    valid_moves = sim_game.get_valid_moves()
                    if not valid_moves:
                        sim_game.game_over = True
                        break
                    continue
                row, col = random.choice(valid_moves)
                sim_game.make_move(row, col)
        winner = sim_game.get_winner()
        current_player = self.game.current_player
        if winner == 0:
            return 0.5
        elif winner == current_player:
            return 1.0
        else:
            return 0.0

    def backpropagate(self, result):
        self.visits += 1
        self.value += result
        if self.parent:
            self.parent.backpropagate(1 - result)

    @staticmethod
    def prepare_input(game):
        board = game.board
        current_player = game.current_player
        opponent = 3 - current_player
        player_channel = (board == current_player).astype(np.float32)
        opponent_channel = (board == opponent).astype(np.float32)
        empty_channel = (board == 0).astype(np.float32)
        state = np.stack([player_channel, opponent_channel, empty_channel])
        tensor = torch.FloatTensor(state).unsqueeze(0)
        return tensor.to(device)


def mcts_search(game, model, num_simulations=400):
    root = MCTSNode(game)
    for _ in range(num_simulations):
        node = root
        while node.is_fully_expanded() and not node.is_terminal():
            node = node.select_child()
        if not node.is_terminal() and not node.is_fully_expanded():
            node = node.expand()
        result = node.rollout(model)
        node.backpropagate(result)
    if root.children:
        best_move = max(root.children.items(),
                        key=lambda item: item[1].visits)[0]
        return best_move
    return None

# =====================
# 6. 自我對弈與訓練數據生成
# =====================


def self_play_game(model):
    game = ReversiGame()
    states, policies, player_turns = [], [], []
    while not game.game_over:
        current_player = game.current_player
        player_turns.append(current_player)
        valid_moves = game.get_valid_moves()
        if not valid_moves:
            game.current_player = 3 - game.current_player
            continue
        state = MCTSNode.prepare_input(game).cpu().squeeze(0).numpy()
        states.append(state)
        policy, _ = model(MCTSNode.prepare_input(game))
        policy = policy.detach().cpu().squeeze(0).numpy()
        move = mcts_search(game, model, num_simulations=200)
        mcts_policy = np.zeros(64, dtype=np.float32)
        if move is not None:
            row, col = move
            mcts_policy[row * 8 + col] = 1.0
        policies.append(mcts_policy)
        if move is not None:
            game.make_move(move[0], move[1])
    winner = game.get_winner()
    rewards = []
    for player in player_turns:
        if winner == 0:
            rewards.append(0.0)
        elif winner == player:
            rewards.append(1.0)
        else:
            rewards.append(-1.0)
    states = np.array(states)
    policies = np.array(policies)
    rewards = np.array(rewards, dtype=np.float32)
    return states, policies, rewards


def generate_training_data(model, num_games=10):
    all_states, all_policies, all_rewards = [], [], []
    for _ in range(num_games):
        states, policies, rewards = self_play_game(model)
        all_states.append(states)
        all_policies.append(policies)
        all_rewards.append(rewards)
    all_states = np.concatenate(all_states)
    all_policies = np.concatenate(all_policies)
    all_rewards = np.concatenate(all_rewards)
    return all_states, all_policies, all_rewards

# =====================
# 7. 模型訓練流程
# =====================


def train_model(model, states, policies, rewards, batch_size=64, epochs=5):
    X = torch.FloatTensor(states).to(device)
    policy_y = torch.FloatTensor(policies).to(device)
    value_y = torch.FloatTensor(rewards).unsqueeze(1).to(device)
    dataset = TensorDataset(X, policy_y, value_y)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    policy_criterion = nn.MSELoss()
    value_criterion = nn.MSELoss()
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for batch_x, batch_policy_y, batch_value_y in dataloader:
            policy_pred, value_pred = model(batch_x)
            policy_loss = policy_criterion(policy_pred, batch_policy_y)
            value_loss = value_criterion(value_pred, batch_value_y)
            loss = policy_loss + value_loss
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        avg_loss = total_loss / len(dataloader)
        print(f'Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}')
    return model

# =====================
# 8. 訓練進度可視化
# =====================


def plot_training_progress(training_history):
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('AI 訓練進度監控', fontsize=16, fontweight='bold')
    if training_history.get('losses'):
        axes[0, 0].plot(training_history['losses'],
                        label='總損失', color='red', linewidth=2)
        axes[0, 0].set_title('訓練損失變化')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('損失值')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        axes[0, 0].set_yscale('log')
    else:
        axes[0, 0].text(0.5, 0.5, '暫無損失數據', ha='center',
                        va='center', fontsize=12)
        axes[0, 0].set_title('訓練損失變化')
    plt.tight_layout()
    plt.show()

# =====================
# 9. 模型轉換為 JavaScript 格式
# =====================


def convert_model_to_js(model, filename="strong_reversi_model.json"):
    model_weights = {}
    for name, param in model.named_parameters():
        model_weights[name] = param.detach().cpu().numpy().tolist()
    with open(filename, 'w') as f:
        json.dump(model_weights, f)
    print(f"模型已轉換並保存為 {filename}")
    return model_weights

# =====================
# 10. 主訓練流程（簡化版）
# =====================


def main():
    print("啟動黑白棋 AI 訓練腳本...")
    model = ReversiNet().to(device)
    print("生成訓練數據...")
    states, policies, rewards = generate_training_data(model, num_games=2)
    print("訓練模型...")
    model = train_model(model, states, policies, rewards, epochs=1)
    print("轉換模型為 JS 格式...")
    convert_model_to_js(model, "test_reversi_model.json")
    print("訓練流程結束。")


if __name__ == '__main__':
    main()
