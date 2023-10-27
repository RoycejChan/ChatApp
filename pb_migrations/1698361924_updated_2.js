/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("emvf4dvjoeily45")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ct9r2wiv",
    "name": "socketID",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("emvf4dvjoeily45")

  // remove
  collection.schema.removeField("ct9r2wiv")

  return dao.saveCollection(collection)
})
