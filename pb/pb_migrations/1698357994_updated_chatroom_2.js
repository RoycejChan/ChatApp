/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("emvf4dvjoeily45")

  collection.name = "2"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("emvf4dvjoeily45")

  collection.name = "chatroom_2"

  return dao.saveCollection(collection)
})
