/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("no5v7hv2wfgrzm2")

  collection.name = "chatroom_1"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("no5v7hv2wfgrzm2")

  collection.name = "chatroom"

  return dao.saveCollection(collection)
})
