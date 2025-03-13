interface ValidationResult {
  isValid: boolean;
  chainId: string;
  error?: string;
}

export function validateTokenAddress(address: string): ValidationResult {
  // Solana address verification: base58 encoding, 44 characters long
  const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{44}$/;

  // Base address verification: 42-character HEX address starting with 0x
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
