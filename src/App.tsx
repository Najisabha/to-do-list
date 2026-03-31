import { useId, useMemo, useState } from 'react'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

function normalizeText(text: string) {
  return text.trim()
}

function makeId() {
  return crypto.randomUUID()
}

export function App() {
  const inputId = useId()
  const [text, setText] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => b.createdAt - a.createdAt)
  }, [todos])

  function addTodo() {
    const normalized = normalizeText(text)
    if (!normalized) return

    const todo: Todo = {
      id: makeId(),
      text: normalized,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos((prev) => [todo, ...prev])
    setText('')
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText('')
  }

  function saveEdit(id: string) {
    const normalized = normalizeText(editingText)
    if (!normalized) return

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: normalized } : t)))
    cancelEdit()
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) cancelEdit()
  }

  return (
    <main className="page">
      <section className="card" aria-label="Todo list">
        <header className="header">
          <div>
            <h1 className="title">Todo</h1>
            <p className="subtitle">أضف مهامك وعلّم المنجز منها</p>
          </div>
          <div className="count" aria-label="Todo count">
            {todos.length}
          </div>
        </header>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault()
            addTodo()
          }}
        >
          <label className="srOnly" htmlFor={inputId}>
            Add todo
          </label>
          <input
            id={inputId}
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب مهمة جديدة…"
            autoComplete="off"
          />
          <button className="button" type="submit" disabled={!normalizeText(text)}>
            Add
          </button>
        </form>

        <ul className="list" aria-label="Todos">
          {sortedTodos.length === 0 ? (
            <li className="empty" aria-label="Empty state">
              لا توجد مهام بعد. اكتب مهمة بالأعلى واضغط Add.
            </li>
          ) : (
            sortedTodos.map((t) => (
              <li key={t.id} className="item">
                <div className="itemRow">
                  <label className="itemMain">
                    <input
                      className="checkbox"
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTodo(t.id)}
                    />

                    {editingId === t.id ? (
                      <input
                        className="editInput"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(t.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        aria-label="Edit todo"
                      />
                    ) : (
                      <span className={t.completed ? 'text done' : 'text'}>{t.text}</span>
                    )}
                  </label>

                  <div className="actions" aria-label="Todo actions">
                    {editingId === t.id ? (
                      <>
                        <button
                          className="actionButton"
                          type="button"
                          onClick={() => saveEdit(t.id)}
                          disabled={!normalizeText(editingText)}
                        >
                          Save
                        </button>
                        <button className="actionButton" type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="actionButton" type="button" onClick={() => startEdit(t)}>
                        Edit
                      </button>
                    )}
                    <button className="actionButton danger" type="button" onClick={() => deleteTodo(t.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}

