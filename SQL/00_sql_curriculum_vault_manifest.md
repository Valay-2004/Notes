---
tags:
  - sql
  - curriculum-roadmap
  - notes-manifest
---

# SQL Complete Course Architecture & Vault Manifest (`Valay-2004/Notes`)

#### TL;DR (Quick Revision)

**Complete SQL Vault Course** = **6 Progressive Folders & 18 Self-Contained Notes** covering 100% of your 15-row ANSI SQL / SQL Server (T-SQL) syllabus image + [ApX Machine Learning SQL for Data Science](https://apxml.com/courses/sql-for-data-science) + Production Mastery (`CTEs`, `Window Functions`, `Views`, `B-Tree Indexes`, `ACID Transactions`, `Stored Procedures`), formatted 1:1 for your `index.html`, `app.js`, and `style.css`.

> [!abstract] Core Idea
> Every note in this restructured course follows your **`sql_master_note_maker_prompt.md`** specification: **one focused concept per file**, human-first explanations, side-by-side **ANSI SQL / SQL Server (T-SQL) vs. MySQL 8.4+** tables, VM-verified `sqlite3` runnable examples, Mermaid v11 diagrams (with `<br/>` line breaks and zero raw `
` inside quotes), and interactive `- [ ] A)` radio-button quizzes compatible with `enhanceTaskLists()` in `app.js`.

---

## 1. Ready-to-Paste `notes-manifest.json` Entry

Copy and paste this `"SQL"` object directly into your repository's `notes-manifest.json`:

```json
{
  "SQL": {
    "01. Beginner Level": [
      "01. Overview of ANSI SQL.md",
      "02. Introduction to Database Design.md",
      "03. Data Modelling Process.md",
      "04. Database Normalization (1NF, 2NF, 3NF).md"
    ],
    "02. Data Types & Constraints": [
      "01. SQL Data Types (ANSI, MySQL & T-SQL).md",
      "02. SQL Constraints (PK, FK, Unique, Check, Not Null).md"
    ],
    "03. Querying, Sorting & Filtering": [
      "01. Querying Data with SELECT.md",
      "02. Sorting Data with ORDER BY.md",
      "03. Filtering Data (WHERE, IN, BETWEEN, LIKE, Aliases).md"
    ],
    "04. Joins, Grouping & Subqueries": [
      "01. Joining Tables (INNER, LEFT, RIGHT, FULL, CROSS, SELF).md",
      "02. Grouping Data (GROUP BY, HAVING, ROLLUP, CUBE, GROUPING SETS).md",
      "03. Subqueries (IN, ANY, ALL, EXISTS, Derived Tables).md",
      "04. Set Operators (UNION, UNION ALL, INTERSECT, EXCEPT).md"
    ],
    "05. Modifying Data & Conditional Expressions": [
      "01. Modifying Data (INSERT, UPDATE JOIN, DELETE, MERGE).md",
      "02. Conditional Expressions (CASE, COALESCE, NULLIF).md"
    ],
    "06. Advanced SQL & Production Mastery": [
      "01. Common Table Expressions (CTEs & Recursive Queries).md",
      "02. Window Functions (ROW_NUMBER, RANK, LEAD, LAG).md",
      "03. Views, Indexes, Transactions & Stored Procedures.md"
    ]
  }
}
```

---

## 2. Complete 18-Note Course Directory & Syllabus Mapping Matrix

| Folder (`SQL/<NN. Folder Name>/`) | Note File (`<NN. Note Name>.md`) | Syllabus Image Row / Extended Topic | Official Grounded Sources |
| :--- | :--- | :--- | :--- |
| **`01. Beginner Level`** | `01. Overview of ANSI SQL.md` | **Row 1: Overview of ANSI SQL** (`DDL`, `DML`, `DQL`, `DCL`, `TCL`, ANSI portability) | [What is SQL? - ApX](https://apxml.com/courses/sql-for-data-science/chapter-1-intro-databases-sql/what-is-sql), [MySQL 8.4 Implicit Commit](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html) |
| **`01. Beginner Level`** | `02. Introduction to Database Design.md` | **Row 2: Introduction to Database Design** (Tables, Rows, Columns, RDBMS vs. NoSQL, ACID, MVCC) | [Tables, Columns, Rows - ApX](https://apxml.com/courses/sql-for-data-science/chapter-1-intro-databases-sql/tables-columns-rows), [MySQL 8.4 InnoDB ACID](https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html) |
| **`01. Beginner Level`** | `03. Data Modelling Process.md` | **Row 3: Data Modelling Process** (5-step design process, Conceptual/Logical/Physical models, Entities & Attributes) | [CREATE TABLE MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/create-table.html), [CREATE TABLE T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17) |
| **`01. Beginner Level`** | `04. Database Normalization (1NF, 2NF, 3NF).md` | **Rows 4 & 5: Database Design + Design Considerations** (`1NF`, `2NF`, `3NF`, `BCNF`, `1:1`/`1:N`/`M:N`, precision, naming) | [Why Combine Data? - ApX](https://apxml.com/courses/sql-for-data-science/chapter-5-combining-data-multiple-tables/why-combine-data), [SQL Server Index Design Guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17) |
| **`02. Data Types & Constraints`** | `01. SQL Data Types (ANSI, MySQL & T-SQL).md` | **Row 6: Data Types** (All 7 categories including `money`, `smallmoney`, `datetime2`, `datetimeoffset`, `nvarchar(max)`, `rowversion`, `hierarchyid`, `sql_variant`, `cursor`, `table`) | [Data Types T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver17), [MySQL 8.4 Other Vendor Data Types](https://dev.mysql.com/doc/refman/8.4/en/other-vendor-data-types.html) |
| **`02. Data Types & Constraints`** | `02. SQL Constraints (PK, FK, Unique, Check, Not Null).md` | **Row 7: Constraints** (`PRIMARY KEY`, `FOREIGN KEY` actions, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`) | [Primary & Foreign Keys T-SQL](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17), [MySQL 8.4 Foreign Keys](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html) |
| **`03. Querying, Sorting & Filtering`** | `01. Querying Data with SELECT.md` | **Row 8: Querying data** (`SELECT` some/all columns, expressions, 8-step Logical Query Execution Order, `GROUP BY`/`HAVING` intro) | [SELECT T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17), [Using MIN and MAX - ApX](https://apxml.com/courses/sql-for-data-science/chapter-4-aggregating-data/finding-min-max) |
| **`03. Querying, Sorting & Filtering`** | `02. Sorting Data with ORDER BY.md` | **Row 9: Sorting data** (`ASC`/`DESC`, multi-column, mixed directions, unselected columns, expressions, ordinal positions, `NULL` sort order) | [ORDER BY Clause T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17), [MySQL 8.4 ORDER BY Optimization](https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html) |
| **`03. Querying, Sorting & Filtering`** | `03. Filtering Data (WHERE, IN, BETWEEN, LIKE, Aliases).md` | **Row 10: Filtering data** (`DISTINCT`, `WHERE`, `AND`/`OR` precedence, `IN`, `BETWEEN`, `LIKE` + T-SQL `[a-z]` vs. MySQL `REGEXP`, Table & Column Aliases) | [Filtering Data Using WHERE - ApX](https://apxml.com/courses/sql-for-data-science/chapter-3-filtering-sorting-data/intro-filtering-where), [LIKE T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17) |
| **`04. Joins, Grouping & Subqueries`** | `01. Joining Tables (INNER, LEFT, RIGHT, FULL, CROSS, SELF).md` | **Row 11: Joining tables** (`INNER`, `LEFT`, `RIGHT`, `FULL OUTER JOIN` + MySQL emulation, `CROSS JOIN`, `Self join`, `ON` vs. `WHERE` trap) | [Joins SQL Server](https://learn.microsoft.com/en-us/sql/relational-databases/performance/joins?view=sql-server-ver17), [MySQL 8.4 JOIN Clause](https://dev.mysql.com/doc/refman/8.4/en/join.html) |
| **`04. Joins, Grouping & Subqueries`** | `02. Grouping Data (GROUP BY, HAVING, ROLLUP, CUBE, GROUPING SETS).md` | **Row 12: Grouping data** (`GROUP BY`, `HAVING`, `GROUPING SETS`, `CUBE`, `ROLLUP`, `GROUPING()` function) | [SELECT - GROUP BY T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17), [MySQL 8.4 GROUP BY Modifiers](https://dev.mysql.com/doc/refman/8.4/en/json-search-functions.html) |
| **`04. Joins, Grouping & Subqueries`** | `03. Subqueries (IN, ANY, ALL, EXISTS, Derived Tables).md` | **Row 13: Subquery** (Scalar, Nested, Expression, `IN`, `ANY`, `ALL`, `EXISTS`/`NOT EXISTS`, `FROM` Derived Tables) | [MySQL 8.4 Subqueries](https://dev.mysql.com/doc/refman/8.4/en/subqueries.html), [MySQL 8.4 Correlated Subqueries](https://dev.mysql.com/doc/refman/8.4/en/correlated-subqueries.html) |
| **`04. Joins, Grouping & Subqueries`** | `04. Set Operators (UNION, UNION ALL, INTERSECT, EXCEPT).md` | **Row 14: Set Operators** (`UNION`, `UNION ALL`, `UNION` vs. `JOIN`, `INTERSECT`, `EXCEPT`, precedence & `NULL` rules) | [MySQL 8.4 Set Operations](https://dev.mysql.com/doc/refman/8.4/en/set-operations.html), [EXCEPT and INTERSECT T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-except-and-intersect-transact-sql?view=sql-server-ver17) |
| **`05. Modifying Data & Conditional Expressions`** | `01. Modifying Data (INSERT, UPDATE JOIN, DELETE, MERGE).md` | **Row 15a: Modifying data** (`INSERT` single/multi-row, `INSERT INTO SELECT`, `UPDATE`, `UPDATE JOIN`, `DELETE`, `MERGE` vs. `ON DUPLICATE KEY UPDATE`) | [MERGE T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17), [MySQL 8.4 INSERT ON DUPLICATE](https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html) |
| **`05. Modifying Data & Conditional Expressions`** | `02. Conditional Expressions (CASE, COALESCE, NULLIF).md` | **Row 15b: Expressions** (`CASE WHEN`, Simple vs. Searched `CASE`, `COALESCE`, `NULLIF`, Conditional Aggregation) | [MySQL 8.4 Flow Control](https://dev.mysql.com/doc/refman/8.4/en/help.html), [Transact-SQL Reference](https://learn.microsoft.com/en-us/sql/t-sql/language-reference?view=sql-server-ver17) |
| **`06. Advanced SQL & Production Mastery`** | `01. Common Table Expressions (CTEs & Recursive Queries).md` | **Extended Mastery 1**: Chained `WITH` CTEs & Hierarchical `WITH RECURSIVE` Queries (`MAXRECURSION` vs. `cte_max_recursion_depth`) | [WITH CTE T-SQL](https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17), [MySQL 8.4 WITH CTE](https://dev.mysql.com/doc/refman/8.4/en/with.html) |
| **`06. Advanced SQL & Production Mastery`** | `02. Window Functions (ROW_NUMBER, RANK, LEAD, LAG).md` | **Extended Mastery 2**: `OVER (PARTITION BY ... ORDER BY ...)`, `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, Sliding Frames | [MySQL 8.4 Window Function Usage](https://dev.mysql.com/doc/refman/8.4/en/window-functions-usage.html) |
| **`06. Advanced SQL & Production Mastery`** | `03. Views, Indexes, Transactions & Stored Procedures.md` | **Extended Mastery 3**: `CREATE VIEW` (`WITH CHECK OPTION`), Clustered vs. Secondary B-Tree Indexes, SARGability, Isolation Levels, `SAVEPOINT`, Stored Procedures | [SQL Server Index Design Guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17), [MySQL 8.4 View Restrictions](https://dev.mysql.com/doc/refman/8.4/en/view-restrictions.html) |
