from kubernetes import client, config
import json
import sys
import paramiko
import sshtunnel

def main():
    # Open the configuration file
    try:
        configFile = open("./config.json")
    except FileNotFoundError:
        sys.stderr.write("ERROR: configuration file not found")
        sys.exit(1)

    config = json.load(configFile)

    # Open SSH tunnel

    with sshtunnel.open_tunnel(
        ("paas-05.fcc21.fogx.me", 22),
        ssh_username=config['SSHUsername'],
        ssh_pkey=config['SSHKey'],
        remote_bind_address=("paas-05.fcc21.fogx.me", 22),
        local_bind_address=('0.0.0.0', 10022)
    ) as tunnel:
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect('127.0.0.1', 10022)
        # do some operations with client session
        

        # Connect to the remote kubernetes environment
        clientConfiguration = client.Configuration()
        clientConfiguration.host = "paas-05.fcc21.fogx.me"
        clientConfiguration.verify_ssl = False
        
        apiClient = client.ApiClient(clientConfiguration)
        v1 = client.CoreV1Api(apiClient)
        ret = v1.list_pod_for_all_namespaces(watch=False)
        for i in ret.items:
            print("%s\t%s\t%s" %
                (i.status.pod_ip, i.metadata.namespace, i.metadata.name))

        client.close()

if __name__ == "__main__":
    main()
