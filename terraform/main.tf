variable "cloudflare_email" {}
variable "cloudflare_api_key" {}
variable "account_id" {}

# Cloudflare Provider Yapılandırması
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  email   = var.cloudflare_email
  api_key = var.cloudflare_api_key       
}

resource "cloudflare_pages_project" "memorlex_site" {
  account_id        = var.account_id
  name              = "memorlex"
  production_branch = "main"

  build_config {
    build_command       = "npm run build"
    destination_dir     = ".next"
    root_dir            = ""
  }

  deployment_configs {
    production {
      # framework_preset buradan kaldırıldı
    }
  }
}

resource "cloudflare_pages_domain" "memorlex_domain" {
  account_id   = "61300c3095e630c556550f1c39527654"
  project_name = cloudflare_pages_project.memorlex_site.name
  domain       = "memorlex.com"
}

resource "cloudflare_record" "pages_dns" {
  zone_id = "8f560606b51a75b425d42a5230690839"
  name    = "@"
  value   = "memorlex-site.pages.dev"
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_filter" "block_threats" {
  zone_id     = "8f560606b51a75b425d42a5230690839"
  description = "Block high threat score IPs"
  expression  = "(cf.threat_score > 10)"
}

resource "cloudflare_firewall_rule" "waf_rule" {
  zone_id     = "8f560606b51a75b425d42a5230690839"
  description = "Apply challenge to high threat score"
  filter_id   = cloudflare_filter.block_threats.id
  action      = "challenge"
}