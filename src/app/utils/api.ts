import axios from "axios";

const api = axios.create({
  baseURL: "https://xz9q-ubfs-tc3s.n7d.xano.io/api:D_ySoT2j",
});

const apiPdfs = axios.create({
  baseURL: "https://xz9q-ubfs-tc3s.n7d.xano.io/api:--QzKR6t",
});

const apiConversation = axios.create({
  baseURL: "https://xz9q-ubfs-tc3s.n7d.xano.io/api:1u7NdjxE",
});

export { api, apiPdfs, apiConversation };
