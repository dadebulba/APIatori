resource "kubernetes_persistent_volume_claim" "mongo_pvc_testing" {
  metadata {
    name = "mongo-pvc-testing"
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
    volume_name = "${kubernetes_persistent_volume.mongo_volume_testing.metadata.0.name}"
  }
}

resource "kubernetes_persistent_volume" "mongo_volume_testing" {
  metadata {
    name = "mongo-volume-testing"
  }
  spec {
    capacity = {
      storage = "2Gi"
    }
    access_modes = ["ReadWriteOnce"]
    persistent_volume_source {
      host_path {
        path = "/home/eval/volume-apiatori-testing"
        type = "DirectoryOrCreate"
      }
    }
  }
}
