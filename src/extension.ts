import * as vscode from "vscode";
import { DexScreenerAPI, TokenInfo } from "./api";
import { validateTokenAddress } from "./utils";

let statusBarItem: vscode.StatusBarItem | undefined;
let refreshInterval: NodeJS.Timer | undefined;
let currentTokenInfo: { chainId: string; address: string } | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Meme Price Checker is now active!");

  // 初始化状态栏项
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  // 注册命令
  let disposable = vscode.commands.registerCommand(
    "meme-price-checker.checkPrice",
    async () => {
      const address = await vscode.window.showInputBox({
        placeHolder: "Enter token contract address (Solana or Base)",
        prompt: "Enter token address to check price",
      });

      if (!address) {
        return;
      }

      const validationResult = validateTokenAddress(address);
      if (!validationResult.isValid) {
        vscode.window.showErrorMessage(
          validationResult.error || "Invalid token address"
        );
        return;
      }

      // 保存当前token信息
      currentTokenInfo = {
        chainId: validationResult.chainId,
        address: address
      };

      // 清除现有的刷新定时器
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      try {
        // 立即刷新价格
        await refreshTokenPrice(validationResult.chainId, address);

        // 设置自动刷新（每30秒）
        refreshInterval = setInterval(() => {
          refreshTokenPrice(validationResult.chainId, address);
        }, 30000);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch price data: ${error}`);
      }
    }
  );

  // 添加刷新命令
  let refreshDisposable = vscode.commands.registerCommand(
    "meme-price-checker.refreshPrice",
    () => {
      if (currentTokenInfo) {
        refreshTokenPrice(currentTokenInfo.chainId, currentTokenInfo.address);
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(refreshDisposable);
  context.subscriptions.push(statusBarItem);
}

function updateStatusBar(tokenData: TokenInfo) {
  if (!statusBarItem) return;

  // 更新代币符号
  statusBarItem.text = `$(circuit-board) ${tokenData.baseToken.symbol.trim()}`;

  // 将所有信息整合到tooltip中
  const price = Number(tokenData.priceUsd);
  const formatChange = (change: number) => {
    const arrow = change >= 0 ? "↑" : "↓";
    return `${arrow} ${Math.abs(change).toFixed(2)}%`;
  };

  statusBarItem.tooltip = [
    `${tokenData.baseToken.name} (${tokenData.dexId})`,
    `Price: $${price.toFixed(price < 0.01 ? 8 : 6)}`,
    `Native Price: ${tokenData.priceNative}`,
    `Market Cap: $${tokenData.marketCap.toLocaleString()}`,
    `Liquidity: $${tokenData.liquidity.usd.toLocaleString()}`,
    "",
    "Price Changes:",
    `5m: ${formatChange(tokenData.priceChange.m5)} (Vol: $${tokenData.volume.m5.toLocaleString()})`,
    `1h: ${formatChange(tokenData.priceChange.h1)} (Vol: $${tokenData.volume.h1.toLocaleString()})`,
    `6h: ${formatChange(tokenData.priceChange.h6)} (Vol: $${tokenData.volume.h6.toLocaleString()})`,
    `24h: ${formatChange(tokenData.priceChange.h24)} (Vol: $${tokenData.volume.h24.toLocaleString()})`
  ].join("\n");

  statusBarItem.show();
}

async function refreshTokenPrice(chainId: string, address: string) {
  try {
    const api = new DexScreenerAPI();
    const data = await api.getTokenPrice(chainId, address);

    if (!data || data.length === 0) {
      vscode.window.showErrorMessage("No price data found for this token");
      return;
    }

    updateStatusBar(data[0]);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fetch price data: ${error}`);
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}
