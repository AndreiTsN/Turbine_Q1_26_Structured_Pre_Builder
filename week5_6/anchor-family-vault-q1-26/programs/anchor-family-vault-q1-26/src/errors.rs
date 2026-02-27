use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Member must be frozen before deletion")]
    MemberNotFrozen,
    #[msg("Too many members")]
    TooManyMembers,
    #[msg("Invalid member state")]
    InvalidMemberState,
}