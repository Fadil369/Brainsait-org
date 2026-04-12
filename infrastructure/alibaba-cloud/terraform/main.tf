terraform {
  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.171"
    }
  }
  required_version = ">= 1.1.0"
}

provider "alicloud" {
  region = var.region
}

# Basic VPC, security group, and ECS instance for Riyadh (me-east-1).
resource "alicloud_vpc" "main" {
  name       = "${var.prefix}-vpc"
  cidr_block = var.vpc_cidr
}

resource "alicloud_vswitch" "main" {
  name              = "${var.prefix}-vsw"
  cidr_block        = "192.168.1.0/24"
  vpc_id            = alicloud_vpc.main.id
  availability_zone = var.az
}

resource "alicloud_security_group" "main" {
  name        = "${var.prefix}-sg"
  vpc_id      = alicloud_vpc.main.id
  description = "Basic security group for ${var.prefix}"
}

resource "alicloud_instance" "app" {
  instance_name              = "${var.prefix}-app"
  instance_type              = var.instance_type
  image_id                   = var.image_id
  security_groups            = [alicloud_security_group.main.id]
  vpc_id                     = alicloud_vpc.main.id
  vswitch_id                 = alicloud_vswitch.main.id
  internet_max_bandwidth_out = 10
  key_name                   = var.ssh_key_name
  tags = {
    Environment = "production"
    Project     = "elfadil"
  }
}

# OSS bucket for application assets
resource "alicloud_oss_bucket" "assets" {
  bucket = "${var.prefix}-assets-${var.region}"
  acl    = "private"
}

# If elfadil.com is managed in Alibaba Cloud DNS (Alidns), create an A record pointing to the instance.
# Be sure the domain is added to your Alibaba Cloud account and you have permissions to manage DNS.
resource "alicloud_alidns_record" "www" {
  domain = var.elfadil_domain
  rr     = "www"
  type   = "A"
  value  = alicloud_instance.app.public_ip
  ttl    = 600
  depends_on = [alicloud_instance.app]
}
