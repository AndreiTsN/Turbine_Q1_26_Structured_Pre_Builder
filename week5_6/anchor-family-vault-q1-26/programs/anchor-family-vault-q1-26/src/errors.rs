use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Member must be frozen before deletion")]
    MemberNotFrozen,
    #[msg("Member frozen")]
    MemberFrozen,
    #[msg("Max members reached")]
    MaxMembersReached,
    #[msg("Invalid member state")]
    InvalidMemberState,
    #[msg("Member count overflow")]
    MemberCountOverflow,
    #[msg("Member count underflow")]
    MemberCountUnderflow,
    #[msg("Invalud max members value")]
    InvalidMaxMembersValue,
    #[msg("Withdraw limit exceeded")]
    WithdrawLimitExceeded,
    #[msg("Member is in cooldown period")]
    MemberInCooldown,
    #[msg("Vault has insufficient funds")]
    InsufficientVaultBalance,
    #[msg("Vault is locked")]
    VaultLocked,
    #[msg("Vault must be empty to close")]
    VaultNotEmpty,
    #[msg("All members must be removed before closing the vault")]
    MembersStillExist,
}