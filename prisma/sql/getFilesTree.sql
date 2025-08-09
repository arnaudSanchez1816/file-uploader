WITH RECURSIVE filesTree AS (
    (SELECT id, name, created_at, type, owner_id, parent_id, 1 AS level
    FROM files
    WHERE id = $1)
    UNION ALL
    (SELECT t.id, t.name, t.created_at, t.type, t.owner_id, t.parent_id, ft.level + 1
    FROM filesTree ft
    INNER JOIN files t ON t.parent_id = ft.id)
)

SELECT 
    ft.id, 
    ft.name, 
    ft.created_at AS "createdAt", 
    ft.type, 
    ft.owner_id AS "ownerId",
    ft.parent_id AS "parentId",
    (CASE WHEN ft.parent_id IS NOT NULL 
        THEN json_build_object(
            'id', p.id,
            'name', p.name,
            'createdAt', p.created_at,
            'type', p.type,
            'ownerId', p.owner_id,
            'parentId', p.parent_id
    )END) AS "parent"
FROM filesTree ft
LEFT JOIN files p ON ft.parent_id = p.id
LEFT JOIN users u ON ft.owner_id = u.id
ORDER BY ft.level;