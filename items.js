import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const myfun = async () => {
  const client = new SuiClient({ url: getFullnodeUrl("devnet") });
  const tableID =
    "0x46d17eb9439ab967a7ec8d3492ff22b1544226e930a6ce11d5ec1be182e9890d";

  const tableOjbect = await client.getObject({
    id: tableID,
    options: {
      showContent: true,
    },
  });
  const dynamicID = tableOjbect.data.content.fields.table.fields.id.id;

  const tmpItems = await client.getDynamicFields({ parentId: dynamicID });
  const ids = tmpItems.data.map((item) => {
    return item.objectId;
  });
  console.log("ids =>", ids);

  const tableItems = await client.multiGetObjects({
    ids: ids,
    options: {
      showContent: true,
    },
  });
  tableItems.forEach((item) => {
    console.log("table item =>", item.data.content.fields.value.fields);
  });
};

myfun();
