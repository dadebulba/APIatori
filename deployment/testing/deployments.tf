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

// Gateway deployment
resource "kubernetes_deployment" "gateway_deployment" {
  metadata {
    name      = "gateway_test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_gateway_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_gateway_test"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-gateway"
          name  = "apiatori-gateway"
          image_pull_policy = "Always"
          port {
            container_port = 8080
          }
          env {
            name  = "PROD"
            value = true
          }
        }
      }
    }
  }
}

// Identity server deployment
resource "kubernetes_deployment" "auth_deployment" {
  metadata {
    name      = "auth_test"
    namespace = "default"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "l_auth_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_auth_test"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-auth"
          name  = "apiatori-auth"
          image_pull_policy = "Always"
          port {
            container_port = 3000
          }
          env {
            name  = "PROD"
            value = true
          }
        }
      }
    }
  }
}

// Spaces data layer deployment
resource "kubernetes_deployment" "spaces_deployment" {
  metadata {
    name      = "spaces_test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_spaces_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_spaces_test"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-spaces"
          name  = "apiatori-spaces"
          image_pull_policy = "Always"
          port {
            container_port = 3002
          }
          env {
            name  = "PROD"
            value = true
          }
        }
      }
    }
  }
}

// Groups data layer deployment
resource "kubernetes_deployment" "groups_deployment" {
  metadata {
    name      = "groups_test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_groups_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_groups_test"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-groups"
          name  = "apiatori-groups"
          image_pull_policy = "Always"
          port {
            container_port = 3003
          }
          env {
            name  = "PROD"
            value = true
          }
        }
      }
    }
  }
}

// Users data layer deployment
resource "kubernetes_deployment" "users_deployment" {
  metadata {
    name      = "users_test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_users_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_users_test"
        }
      }
      spec {
        container {
          image = "dadebulba/apiatori-users"
          name  = "apiatori-users"
          image_pull_policy = "Always"
          port {
            container_port = 3004
          }
          env {
            name  = "PROD"
            value = true
          }
        }
      }
    }
  }
}

// MongoDB deployment
resource "kubernetes_deployment" "mongodb_users_deployment" {
  metadata {
    name      = "mongodb_test"
    namespace = "default"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "l_mongodb_test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_mongodb_test"
        }
      }
      spec {
        container {
          image = "mongo:latest"
          name  = "mongodb"
          image_pull_policy = "Always"
          port {
            container_port = 27017
          }
          env {
            name  = "MONGO_INITDB_ROOT_USERNAME"
            value = "apiatori"
          }
          env {
            name  = "MONGO_INITDB_ROOT_PASSWORD"
            value = "apiatori"
          }
        }
      }
    }
  }
}