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

// Gateway resource
resource "kubernetes_deployment" "gateway_deployment" {
  metadata {
    name      = "gateway"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_gateway"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_gateway"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-gateway"
          name  = "apiatori-gateway"
          port {
            container_port = 8080
          }
        }
      }
    }
  }
}
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
resource "kubernetes_service" "test" {
  metadata {
    name      = "gateway"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_gateway"
    }
    type = "NodePort"
    port {
      node_port   = 8080
      port        = 8080
      target_port = 8080
    }
  }
}