use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("7YXoKXKRbuqVtYptxZ22wUAisj9fddQoipA7zq9aNsHN");

#[program]
pub mod anchor_escrow_q1_26 {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, depoist: u64, recive: u64) -> Result<()> {
        ctx.accounts.deposit(depoist)?;
        ctx.accounts.init_escrow(seed, recive, &ctx.bumps)
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        ctx.accounts.withdraw_and_close_vault()
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }

}

