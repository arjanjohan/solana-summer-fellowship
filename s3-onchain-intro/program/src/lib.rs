
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token::{Token, TokenAccount, Transfer, transfer},
    },
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[account]
pub struct UserVault {
    pub owner: Pubkey,       // Owner of the vault (the user)
    pub token_mints: Vec<Pubkey>, // List of token mints deposited
    pub balances: Vec<u64>,  // Corresponding list of token amounts
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(init, payer = user, space = 8 + 32 + (32 * 10) + (8 * 10))] // 8 for discriminator, 32 for owner, and space for up to 10 tokens.
    pub vault: Account<'info, UserVault>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSpl<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, UserVault>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawSpl<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, UserVault>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    pub to_ata: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}


#[program]
pub mod token_vault {
    use super::*;


    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = *ctx.accounts.user.key;
        vault.token_mints = Vec::new();
        vault.balances = Vec::new();
        Ok(())
    }

    pub fn deposit_spl_tokens(ctx: Context<DepositSpl>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let mint = ctx.accounts.from_ata.mint;

        // Find if the token mint is already in the vault
        if let Some(index) = vault.token_mints.iter().position(|&m| m == mint) {
            vault.balances[index] = vault.balances[index].checked_add(amount).unwrap();
        } else {
             vault.token_mints.push(mint);
            vault.balances.push(amount);
        }

        let transfer_instruction = Transfer {
            from: ctx.accounts.from_ata.to_account_info(),
            to: ctx.accounts.to_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        transfer(CpiContext::new(cpi_program, transfer_instruction), amount)?;

        Ok(())
    }


    pub fn withdraw_spl_tokens(ctx: Context<WithdrawSpl>, mint: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // Find the index of the token mint in the vault
        if let Some(index) = vault.token_mints.iter().position(|&m| m == mint) {
            // Get the full balance for the specified mint
            let amount = vault.balances[index];

            // Transfer the tokens back to the user
            let transfer_instruction = Transfer {
                from: ctx.accounts.from_ata.to_account_info(),
                to: ctx.accounts.to_ata.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            transfer(CpiContext::new(cpi_program, transfer_instruction), amount)?;

            // Remove the mint and balance from the vault after withdrawal
            vault.token_mints.remove(index);
            vault.balances.remove(index);

            Ok(())
        } else {
            // If the mint is not found, return an error
            Err(ErrorCode::TokenNotFound.into())
        }
    }

}