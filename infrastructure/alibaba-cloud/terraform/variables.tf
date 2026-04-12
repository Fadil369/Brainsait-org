variable "region" {
  description = "Alibaba Cloud region"
  type        = string
  default     = "me-east-1" # Riyadh
}

variable "prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "elfadil"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "192.168.0.0/16"
}

variable "az" {
  description = "Availability zone"
  type        = string
  default     = "me-east-1a"
}

variable "instance_type" {
  description = "ECS instance type"
  type        = string
  default     = "ecs.t6-c1m1.large"
}

variable "image_id" {
  description = "AMI / image id to use for ECS instance (regional). Provide a value before apply."
  type        = string
  default     = ""
}

variable "ssh_key_name" {
  description = "Existing SSH key pair name in Alibaba Cloud (optional)"
  type        = string
  default     = ""
}

variable "elfadil_domain" {
  description = "Primary domain for the deployment"
  type        = string
  default     = "elfadil.com"
}
