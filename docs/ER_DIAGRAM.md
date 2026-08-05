# Entity-Relationship Diagram

Renders natively on GitHub. See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the normalization
rationale behind these relationships (which are embedded vs. referenced, and why).

```mermaid
erDiagram
    USER ||--o{ RESTAURANT : owns
    USER ||--o| DELIVERY_PARTNER_PROFILE : "extends (role=deliveryPartner)"
    USER ||--o{ CART : owns
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : receives

    RESTAURANT ||--o{ CATEGORY : defines
    RESTAURANT ||--o{ MENU_ITEM : lists
    RESTAURANT ||--o{ ORDER : receives
    RESTAURANT ||--o{ REVIEW : receives
    RESTAURANT ||--o{ CART : "held in"

    CATEGORY ||--o{ MENU_ITEM : groups

    MENU_ITEM ||--o{ CART : "referenced by (line item, snapshotted)"
    MENU_ITEM ||--o{ ORDER : "referenced by (line item, snapshotted)"

    ORDER ||--o{ PAYMENT : "paid via"
    ORDER ||--o| REVIEW : unlocks
    DELIVERY_PARTNER_PROFILE ||--o{ ORDER : delivers

    USER {
        ObjectId _id
        string name
        string email UK
        string password "bcrypt hash, select:false"
        string phone
        string role "customer|restaurantOwner|deliveryPartner|admin"
        array addresses
        string avatarUrl
        string refreshTokenHash "select:false"
        boolean isActive
    }
    RESTAURANT {
        ObjectId _id
        ObjectId owner FK
        string name
        array cuisine
        object address
        object location "GeoJSON Point, 2dsphere"
        string logoUrl "Cloudinary URL"
        string coverImageUrl "Cloudinary URL"
        boolean isOpen
        boolean isApproved
        number ratingAvg
        number ratingCount
    }
    CATEGORY {
        ObjectId _id
        ObjectId restaurant FK
        string name
        number displayOrder
    }
    MENU_ITEM {
        ObjectId _id
        ObjectId restaurant FK
        ObjectId category FK
        string name
        number price
        string imageUrl "Cloudinary URL"
        boolean isAvailable
        boolean isVeg
        array addOns
    }
    CART {
        ObjectId _id
        ObjectId user FK
        ObjectId restaurant FK
        array items "snapshotted name/price"
    }
    ORDER {
        ObjectId _id
        ObjectId user FK
        ObjectId restaurant FK
        ObjectId deliveryPartner FK
        array items "snapshotted"
        string status
        string paymentMethod "razorpay|cashOnDelivery"
        object pricing
        array statusHistory
    }
    PAYMENT {
        ObjectId _id
        ObjectId order FK
        ObjectId user FK
        number amount
        string status "pending|paid|failed|refunded"
        string method
        string gateway "razorpay|cash"
        string gatewayOrderId "Razorpay order id"
        string transactionId "Razorpay payment id, set on verify"
    }
    REVIEW {
        ObjectId _id
        ObjectId user FK
        ObjectId restaurant FK
        ObjectId order FK
        number rating
        string comment
    }
    DELIVERY_PARTNER_PROFILE {
        ObjectId _id
        ObjectId user FK
        string vehicleType
        object currentLocation "GeoJSON Point, 2dsphere"
        boolean isAvailable
        ObjectId currentOrder FK
        number ratingAvg
        number ratingCount
    }
    NOTIFICATION {
        ObjectId _id
        ObjectId user FK
        string type
        string title
        string message
        boolean isRead
    }
```
