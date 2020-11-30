const express = require("express");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  ContainerClient
} = require("@azure/storage-blob");

const app = express();

const azureURL = "someurl";

const azureCredential = {
  name: "devstoreaccount1",
  key:
    "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
};

const blobServiceClient = BlobServiceClient.fromConnectionString(
  `DefaultEndpointsProtocol=http;AccountName=${azureCredential.name};AccountKey=${azureCredential.key};BlobEndpoint=http://${azureURL}:10000/${azureCredential.name};QueueEndpoint=http://${azureURL}:10001/${azureCredential.name};`
);

const containerClient = blobServiceClient.getContainerClient("arvr");

const storageSharedKeyCredential = new StorageSharedKeyCredential(
  azureCredential.name,
  azureCredential.key
);

/**
 *
 * @param {ContainerClient} containerClient
 * @param {StorageSharedKeyCredential} sharedKeyCredential
 * @param {*} storedPolicyName
 */
function getContainerSasUri(
  containerClient,
  sharedKeyCredential,
  storedPolicyName = null
) {
  const sasOptions = {
    containerName: containerClient.containerName,
    permissions: ContainerSASPermissions.parse("c")
  };

  if (storedPolicyName === null) {
    sasOptions.startsOn = new Date();
    sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
  } else {
    sasOptions.identifier = storedPolicyName;
  }

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();
  console.log(`SAS token for blob container is: ${sasToken}`);

  return `${containerClient.url}?${sasToken}`;
}

app.get("/", (_req, res) => {
  const token = getContainerSasUri(containerClient, storageSharedKeyCredential);

  res.json({ status: "ok", token });
});

app.listen("8080", () => {
  console.log("server is started!");
});
