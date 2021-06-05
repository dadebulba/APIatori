// Gateway service
resource "kubernetes_service" "gateway_service" {
  metadata {
    name      = "gateway_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_gateway_test"
    }
    type = "NodePort"
    port {
      node_port   = 30080
      port        = 8080
      target_port = 8080
    }
  }
}

// MongoDB service
resource "kubernetes_service" "mongodb_service" {
  metadata {
    name      = "mongodb_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_mongodb_test"
    }
    type = "ClusterIP"
    port {
      port        = 27017
      target_port = 27017
    }
  }
}

// Auth service
resource "kubernetes_service" "auth_service" {
  metadata {
    name      = "auth_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_auth_test"
    }
    type = "ClusterIP"
    port {
      port        = 3000
      target_port = 3000
    }
  }
}

// Spaces service
resource "kubernetes_service" "spaces_service" {
  metadata {
    name      = "spaces_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_spaces_test"
    }
    type = "ClusterIP"
    port {
      port        = 3002
      target_port = 3002
    }
  }
}

// Groups service
resource "kubernetes_service" "groups_service" {
  metadata {
    name      = "groups_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_groups_test"
    }
    type = "ClusterIP"
    port {
      port        = 3003
      target_port = 3003
    }
  }
}

// Users service
resource "kubernetes_service" "users_service" {
  metadata {
    name      = "users_test"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_users_test"
    }
    type = "ClusterIP"
    port {
      port        = 3004
      target_port = 3004
    }
  }
}