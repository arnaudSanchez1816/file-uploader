WITH RECURSIVE filesTree AS (
    SELECT id, name, created_at, type, owner_id, parent_id, 0 AS level
    FROM file_uploader.files
    WHERE id = $1
), goDown AS (
    TABLE filesTree
    UNION ALL
    (SELECT t.id, t.name, t.created_at, t.type, t.owner_id, t.parent_id, ft.level + 1
    FROM file_uploader.files t
    INNER JOIN goDown ft ON t.parent_id = ft.id)
) CYCLE id SET is_cycle USING path
, goUp AS (
    TABLE filesTree
    UNION ALL
    (SELECT t.id, t.name, t.created_at, t.type, t.owner_id, t.parent_id, ft.level - 1
    FROM file_uploader.files t
    INNER JOIN goUp ft ON t.id = ft.parent_id)
) CYCLE id SET is_cycle USING path
, results AS (
    SELECT *
    FROM goDown
    UNION
    (SELECT * FROM goUp)
)

SELECT 
    ft.id, 
    ft.name, 
    ft.created_at AS "createdAt", 
    ft.type, 
    ft.owner_id AS "ownerId",
    ft.parent_id AS "parentId",
    ft.level AS "level"
FROM results ft
LEFT JOIN file_uploader.files p ON ft.parent_id = p.id
LEFT JOIN file_uploader.users u ON ft.owner_id = u.id
ORDER BY ft.level;