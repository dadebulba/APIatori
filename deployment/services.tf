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
      node_port   = 8080
      port        = 8080
      target_port = 8080
    }
  }
}