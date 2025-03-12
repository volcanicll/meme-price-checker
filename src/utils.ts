interface ValidationResult {
  isValid: boolean;
  chainId: string;
  error?: string;
}

export function validateTokenAddress(address: string): ValidationResult {
  // Solana地址验证：base58编码，44字符长度
  const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{44}$/;

  // Base地址验证：0x开头的42字符HEX地址
  const BASE_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

  if (!address) {
    return {
      isValid: false,
      chainId: "",
      error: "Token address is required",
    };
  }

  if (SOLANA_ADDRESS_REGEX.test(address)) {
    return {
      isValid: true,
      chainId: "solana",
    };
  }

  if (BASE_ADDRESS_REGEX.test(address)) {
    return {
      isValid: true,
      chainId: "base",
    };
  }

  return {
    isValid: false,
    chainId: "",
    error: "Invalid token address format",
  };
}
