from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


_load_dotenv()
DEFAULT_SQLITE_URL = f"sqlite:///{(Path(__file__).resolve().parents[1] / 'dev.db').as_posix()}"


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8787"))
    upload_dir: str = os.getenv(
        "UPLOAD_DIR",
        str((Path(__file__).resolve().parents[1] / "uploads").resolve()),
    )
    token_ttl_hours: int = int(os.getenv("TOKEN_TTL_HOURS", "720"))
    admin_bootstrap_nicknames: tuple[str, ...] = tuple(
        _split_csv(os.getenv("ADMIN_BOOTSTRAP_NICKNAMES", ""))
    )
    makkie_admin_username: str = os.getenv("MAKKIE_ADMIN_USERNAME", "admin")
    makkie_admin_password: str = os.getenv("MAKKIE_ADMIN_PASSWORD", "change-me")
    makkie_admin_display_name: str = os.getenv("MAKKIE_ADMIN_DISPLAY_NAME", "Makkie Admin")


settings = Settings()
