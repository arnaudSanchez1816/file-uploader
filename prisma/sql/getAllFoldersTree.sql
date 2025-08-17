WITH RECURSIVE homeFolders AS (
    SELECT id, name, created_at, type, owner_id, parent_id, 0 AS level
    FROM file_uploader.files
    WHERE parent_id IS NULL AND type = 'FOLDER'
), goDown AS (
    TABLE homeFolders
    UNION ALL
    (SELECT this.id, this.name, this.created_at, this.type, this.owner_id, this.parent_id, previous.level + 1
    FROM file_uploader.files this
    INNER JOIN goDown previous ON this.parent_id = previous.id
    WHERE this.type = 'FOLDER')
)

SELECT 
    ft.id, 
    ft.name, 
    ft.created_at AS "createdAt", 
    ft.type, 
    ft.owner_id AS "ownerId",
    ft.parent_id AS "parentId",
    ft.level AS "level"
FROM goDown ft
LEFT JOIN file_uploader.files p ON ft.parent_id = p.id
LEFT JOIN file_uploader.users u ON ft.owner_id = u.id
ORDER BY ft.level;