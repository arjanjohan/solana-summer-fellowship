
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token::{Token, TokenAccount, Transfer, transfer},
    },
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[derive(Accounts)]
pub struct TransferSpl<'info> {
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,
    pub signer: Signer<'info>,
}

#[program]
pub mod token_contract {
    use super::*;
    pub fn transfer_spl_tokens(ctx: Context<TransferSpl>, amount: u64) -> Result<()> {

        // Transfer tokens from taker to initializer
        let transfer_intruction = Transfer {
            from: ctx.accounts.from_ata.to_account_info(),
            to: ctx.accounts.to_ata.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        transfer(
            CpiContext::new(cpi_program, transfer_intruction),
            amount)?;
        Ok(())
    }
}