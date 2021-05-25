terraform {
    required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

// Gateway autoscaler
resource "kubernetes_horizontal_pod_autoscaler" "gateway_deployment_autoscaler" {
  metadata {
    name = "gateway"
  }
  spec {
    min_replicas = 2
    max_replicas = 7
    scale_target_ref {
      kind = "Deployment"
      name = "apiatori-gateway"
    }
    metric {
      type = "External"
      external {
        metric {
          name = "latency"
          selector {
            match_labels = {
              lb_name = "l_gateway"
            }
          }
        }
        target {
          type  = "Value"
          value = "100"
        }
      }
    }
  }
}

// Spaces data layer autoscaler
resource "kubernetes_horizontal_pod_autoscaler" "spaces_deployment_autoscaler" {
  metadata {
    name = "spaces"
  }
  spec {
    min_replicas = 2
    max_replicas = 7
    scale_target_ref {
      kind = "Deployment"
      name = "apiatori-spaces"
    }
    metric {
      type = "External"
      external {
        metric {
          name = "latency"
          selector {
            match_labels = {
              lb_name = "l_spaces"
            }
          }
        }
        target {
          type  = "Value"
          value = "100"
        }
      }
    }
  }
}

// Groups data layer autoscaler
resource "kubernetes_horizontal_pod_autoscaler" "groups_deployment_autoscaler" {
  metadata {
    name = "groups"
  }
  spec {
    min_replicas = 2
    max_replicas = 7
    scale_target_ref {
      kind = "Deployment"
      name = "apiatori-groups"
    }
    metric {
      type = "External"
      external {
        metric {
          name = "latency"
          selector {
            match_labels = {
              lb_name = "l_groups"
            }
          }
        }
        target {
          type  = "Value"
          value = "100"
        }
      }
    }
  }
}

// Users data layer autoscaler
resource "kubernetes_horizontal_pod_autoscaler" "users_deployment_autoscaler" {
  metadata {
    name = "users"
  }
  spec {
    min_replicas = 2
    max_replicas = 7
    scale_target_ref {
      kind = "Deployment"
      name = "apiatori-users"
    }
    metric {
      type = "External"
      external {
        metric {
          name = "latency"
          selector {
            match_labels = {
              lb_name = "l_users"
            }
          }
        }
        target {
          type  = "Value"
          value = "100"
        }
      }
    }
  }
}