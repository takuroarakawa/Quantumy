use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use bcrypt::BcryptError;
use jsonwebtoken::errors::Error as JwtError;
use sqlx::Error as SqlxError;

use crate::models::auth::ErrorResponse;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    Conflict(String),
    Internal(String),
}

impl AppError {
    pub fn bad_request(message: impl Into<String>) -> Self {
        Self::BadRequest(message.into())
    }

    pub fn unauthorized(message: impl Into<String>) -> Self {
        Self::Unauthorized(message.into())
    }

    pub fn conflict(message: impl Into<String>) -> Self {
        Self::Conflict(message.into())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::BadRequest(message) => (StatusCode::BAD_REQUEST, message),
            Self::Unauthorized(message) => (StatusCode::UNAUTHORIZED, message),
            Self::Conflict(message) => (StatusCode::CONFLICT, message),
            Self::Internal(message) => (StatusCode::INTERNAL_SERVER_ERROR, message),
        };

        (status, Json(ErrorResponse { error: message })).into_response()
    }
}

impl From<SqlxError> for AppError {
    fn from(error: SqlxError) -> Self {
        Self::Internal(format!("database error: {error}"))
    }
}

impl From<BcryptError> for AppError {
    fn from(error: BcryptError) -> Self {
        Self::Internal(format!("bcrypt error: {error}"))
    }
}

impl From<JwtError> for AppError {
    fn from(error: JwtError) -> Self {
        Self::Internal(format!("jwt error: {error}"))
    }
}
