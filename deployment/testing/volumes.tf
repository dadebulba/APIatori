resource "kubernetes_persistent_volume_claim" "mongo_pvc_testing" {
  metadata {
    name = "mongo-pvc-testing"
  }
  spec {
    access_modes = ["ReadWriteMany"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
    volume_name = "${kubernetes_persistent_volume.mongo_volume_testing.metadata.name}"
  }
}

resource "kubernetes_persistent_volume" "mongo_volume_testing" {
  metadata {
    name = "mongo-volume-testing"
  }
  spec {
    capacity = {
      storage = "1Gi"
    }
    access_modes = ["ReadWriteMany"]
    persistent_volume_source {
      host_path {
        path = "/var/local/apiatori-testing"
        type = "DirectoryOrCreate"
      }
      /*
      gce_persistent_disk {
        pd_name = "test-123"
      }
      */
    }
  }
}
