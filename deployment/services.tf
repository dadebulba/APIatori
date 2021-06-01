// Gateway service
resource "kubernetes_service" "gateway_service" {
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
      node_port   = 30080
      port        = 8080
      target_port = 8080
    }
  }
}

// MongoDB service
resource "kubernetes_service" "mongodb_service" {
  metadata {
    name      = "mongodb"
    namespace = "default"
  }
  spec {
    selector = {
      app = "l_mongodb"
    }
    type = "ClusterIP"
    port {
      port        = 27017
      target_port = 27017
    }
  }
}