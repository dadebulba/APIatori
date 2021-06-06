resource "kubernetes_persistent_volume_claim" "mongo_pvc_testing" {
  metadata {
    name = "mongo_pvc_testing"
  }
  spec {
    access_modes = ["ReadWriteMany"]
    resources {
      requests = {
        storage = "2Gi"
      }
    }
    volume_name = "${kubernetes_persistent_volume.mongo_volume_testing.metadata.0.name}"
  }
}

resource "kubernetes_persistent_volume" "mongo_volume_testing" {
  metadata {
    name = "mongo_volume_testing  "
  }
  spec {
    capacity = {
      storage = "2Gi"
    }
    access_modes = ["ReadWriteMany"]
    persistent_volume_source {
      host_path {
        path = "/var/local/apiatori-testing"
        type = "FileOrCreate"
      }
      /*
      gce_persistent_disk {
        pd_name = "test-123"
      }
      */
    }
  }
}