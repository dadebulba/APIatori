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
    name      = "gateway-test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_gateway-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_gateway-test"
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
            name  = "TESTING"
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
    name      = "auth-test"
    namespace = "default"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "l_auth-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_auth-test"
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
            name  = "TESTING"
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
    name      = "spaces-test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_spaces-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_spaces-test"
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
            name  = "TESTING"
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
    name      = "groups-test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_groups-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_groups-test"
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
            name  = "TESTING"
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
    name      = "users-test"
    namespace = "default"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "l_users-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_users-test"
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
            name  = "TESTING"
            value = true
          }
        }
      }
    }
  }
}

// MongoDB deployment
/*
resource "kubernetes_deployment" "mongodb_users_deployment" {
  metadata {
    name      = "mongodb-test"
    namespace = "default"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "l_mongodb-test"
      }
    }
    template {
      metadata {
        labels = {
          app = "l_mongodb-test"
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
*/