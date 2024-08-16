# s5-security



## Security issues found

### Overflow/underflow

#### Problem
in `transfer_points` its  possible to overflow points. 
```
sender.points -= amount;
receiver.points += amount;        
```

#### Fix
Use either checked_add/sub or saturating_add/sub.
```
sender.points.saturating_sub(amount);
receiver.points.checked_add(amount)        
```

### Missing signer check `transfer_points`
 
#### Problem
Not checking if caller is signer in the `transfer_points` function.


```
let sender = &mut ctx.accounts.sender;

```

#### Fix
```
let sender = &mut ctx.accounts.sender;
if !sender.is_signer {
    return Err(ProgramError::MissingSigner);
}
```


### Missing ownership check `remove_user`

#### Problem
Not checking if caller is owner of the `user` it tries to delete.

```
pub fn remove_user(_ctx: Context<TransferPoints>, id:u32) -> Result<()> {
    msg!("Account closed for user with id: {}", id);
    Ok(())
}  
```

#### Fix

- Change ctx from `Context<TransferPoints>` to `Context<RemoveUser>`.
- Check if `user` is `signer`

```
pub fn remove_user(ctx: Context<RemoveUser>, id:u32) -> Result<()> {
    if ctx.user != ctx.signer {
        return Err(ProgramError::InvalidAdminAccount);
    }
    msg!("Account closed for user with id: {}", id);
    Ok(())
}  
```







https://github.com/GitBolt/insecure-program