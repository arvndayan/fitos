from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./fitos.db"
    usda_api_key: str = ""
    open_food_facts_user_agent: str = "FitOS/0.4 (contact: dev@example.com)"
    cors_origins: str = "http://localhost:5500,https://arvndayan.github.io"
    usda_enabled: bool = True
    open_food_facts_enabled: bool = True
    cache_external_results: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
