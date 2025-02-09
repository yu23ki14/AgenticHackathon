/**
 * Abbreviates an Ethereum address.
 * @param address - The Ethereum address to abbreviate.
 * @returns The abbreviated address.
 */
export function abbreviateAddress(address: string): string {
    if (!address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid Ethereum address');
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
