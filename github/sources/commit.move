module github::commit {
    use sui::table::{Self, Table};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self,TxContext};
    use std::string::String;
    use sui::transfer;

    // Define the structure of the items to be stored in the table.
    struct Item has store {
        url: String,
        author_username: String,
        message: String,
        timestamp: String,
    }

    // Define the structure for the shared table.
    struct SharedTable has key {
        id: UID,
        table: Table<address, Item>,
    }

    // Initialize the module, creating the shared table.
    fun init(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let table = table::new<address,Item>(ctx);
        transfer::share_object(SharedTable { id, table });
    }

    // Function to insert an item into the shared table.
    public entry fun push_commit(
        shared_table: &mut SharedTable,
        url: String,
        author_username: String,
        message: String,
        timestamp: String,
        ctx: &mut TxContext,
    ) {
        let item = Item { url, author_username, message, timestamp };
        table::add(&mut shared_table.table,tx_context::fresh_object_address(ctx), item); 
    }
    
    
}