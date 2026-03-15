use jsonwebtoken::{encode, errors::Error, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i64,
    pub username: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn create_token(
    user_id: i64,
    username: &str,
    secret: &str,
    expires_in_seconds: i64,
) -> Result<String, Error> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time before UNIX_EPOCH")
        .as_secs() as i64;
    let claims = Claims {
        sub: user_id,
        username: username.to_owned(),
        iat: now as usize,
        exp: (now + expires_in_seconds) as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}
