import { useEffect, useState } from "react"
import { MdAdd, MdCancel, MdCheck, MdDelete, MdDone, MdModeEditOutline } from "react-icons/md";
import axios from 'axios'
import { API_URL } from '../services/api'

interface Todo { todo_id: number; description: string; completed: boolean }

const App = () => {
  const [description, setDescription] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingTodo, setEditingTodo] = useState<number | null>(null)
  const [editedText, setEditedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/todos`)
      setTodos(res.data)
      console.log(res.data)
    } catch (err) {
      console.error("Cannot get todos", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTodos()
  }, [])

  const onSubmitForm = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    if (!description.trim()) return;
    try {
      setError(null)
      const res = await axios.post(`${API_URL}/todos`, {
        description, completed: false
      })
      setTodos([...todos, res.data])
      setDescription('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting form:", err.message);
      }
      else { console.error("Unexpected error:", err); }
      setError('Failed to add todo. Please try again')
    }
  }


  const saveEdit = async (id: number) => {
    try {
      setError(null)

      const currentTodo = todos.find((todo) => todo.todo_id === id)
      const trimmedText = editedText.trim()

      if (currentTodo?.description === trimmedText) {
        setEditedText('')
        setEditingTodo(null)
        return
      }

      await axios.put(`${API_URL}/todos/${id}`, {
        description: editedText,
      })
      setEditedText('')
      setEditingTodo(null)
      setTodos(todos.map((todo) => todo.todo_id === id ? {
        ...todo, description: editedText, completed: false
      } : todo))

    } catch (err) {
      console.error("failed to save todos", err)
      setError('Failed to update todo. Please try again.')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      setError(null)
      await axios.delete(`${API_URL}/todos/${id}`)
      setTodos(todos.filter((todo) => todo.todo_id !== id))
    }
    catch (err) {
      console.error("failed to delete todos", err)
      setError('Failed to delete todo. Please try again.')
    }
  }

  const toggleCompleted = async (id: number) => {
    try {
      const todo = todos.find((todo) => todo.todo_id === id)
      if (!todo) { console.error("Todo not found"); return; }

      await axios.put(`${API_URL}/todos/${id}`, {
        description: todo.description,
        completed: !todo.completed
      })
      setTodos(todos.map((todo) => (
        todo.todo_id === id ? {
          ...todo, completed: !todo.completed
        } : todo)))

    } catch (err) {
      console.error("toggle failed", err)
    }
  }

  return (
    <>
      <div className="min-h-screen p-3 bg-black/90 flex items-center justify-center">
        <div className="bg-gray-500/40 space-y-8 rounded backdrop-blur-sm shadow-xl w-full max-w-lg p-8">
          <h1 className="text-center text-2xl font-bold text-white/80">
            TODO APP
          </h1>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <form
            onSubmit={onSubmitForm} className=" flex gap-2">
            <input className=" w-full outline-none text-white/90 px-3 py-2 rounded "
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?" required />

            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors duration-300 ease-in-out">
              <MdAdd />
            </button>
          </form>
          <div>
            {loading ? (
              <div className=" flex items-center justify-center">
                <p className=" text-white/90 text-3xl animate-pulse transition-all transform duration-300 ease-in-out">Loading tasks...</p>
              </div>
            ) : todos.length === 0 ? (
              <p className=" text-slate-300/60">No tasks available. Add a new task1</p>
            )
              : (
                <div className=" space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.todo_id}>
                      {editingTodo === todo.todo_id ? (
                        <div className=" flex items-center gap-2 justify-between">
                          <input className="p-3 w-full border rounded-lg border-slate-200 outline-none focus:ring-2 focus:ring-blue-300 text-white/50 shadow-inner"
                            type="text" value={editedText} onChange={(e) => setEditedText(e.target.value)} />
                          <div className=" gap-2 flex">
                            <button onClick={() => saveEdit(todo.todo_id)}
                              className="p-2 text-green-400 hover:text-green-500 rounded-lg text-shadow-sm hover:scale-115 transform transition-all duration-300 ease-in-out"><MdDone /></button>
                            <button onClick={() => setEditingTodo(null)} className="p-2 text-red-400 hover:text-red-500 rounded-lg text-shadow-sm hover:scale-115 transform transition-all duration-300 ease-in-out"><MdCancel /></button>
                          </div>
                        </div>
                      ) : (
                        <div className=" flex justify-between items-center">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <button onClick={() => toggleCompleted(todo.todo_id)} className={`shadow-sm flex shrink-0 border-slate-100/40 h-6 w-6 text-white 
                        ${todo.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:ring-2 ring-blue-300'} rounded-full border-2 flex items-center justify-center`}>
                              {todo.completed && <MdCheck />}
                            </button>
                            <span className={`text-white`}>{todo.description}</span>
                          </div>
                          <div className=" flex gap-x-2">
                            <button onClick={() => {
                              setEditingTodo(todo.todo_id)
                              setEditedText(todo.description)
                            }}

                              className="p-2 text-blue-400 hover:text-blue-500"><MdModeEditOutline /></button>
                            <button onClick={() => deleteTodo(todo.todo_id)} className="p-2 text-red-400 hover:text-red-500"><MdDelete /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App