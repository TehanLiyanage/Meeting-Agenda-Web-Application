import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';

export default function App() {
  const [formData, setFormData] = useState({
    meetingDate: '',
    meetingTime: '',
    meetingTitle: '',
    meetingType: '',
    priority: 'Medium',
    attendees: [],
    agendaItems: [],
    notes: '',
    followUpActions: []
  });

  const [agendas, setAgendas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgendas, setFilteredAgendas] = useState([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [agendaInput, setAgendaInput] = useState({ topic: '', duration: '' });
  const [actionInput, setActionInput] = useState({ task: '', status: 'Not Started' });

  useEffect(() => {
    const storedAgendas = JSON.parse(localStorage.getItem('agendas')) || [];
    const sanitized = storedAgendas.map(a => ({
      ...a,
      attendees: Array.isArray(a.attendees) ? a.attendees : [],
      agendaItems: Array.isArray(a.agendaItems) ? a.agendaItems : [],
      followUpActions: Array.isArray(a.followUpActions) ? a.followUpActions : []
    }));
    setAgendas(sanitized);
    setFilteredAgendas(sanitized);
  }, []);

  useEffect(() => {
    const filtered = agendas.filter(agenda =>
      agenda.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgendas(filtered);
  }, [searchTerm, agendas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAgendas = [...agendas, formData];
    setAgendas(updatedAgendas);
    localStorage.setItem('agendas', JSON.stringify(updatedAgendas));
    toast.success('Meeting agenda saved successfully!');
    setFormData({
      meetingDate: '',
      meetingTime: '',
      meetingTitle: '',
      meetingType: '',
      priority: 'Medium',
      attendees: [],
      agendaItems: [],
      notes: '',
      followUpActions: []
    });
    setAttendeeInput('');
    setAgendaInput({ topic: '', duration: '' });
    setActionInput({ task: '', status: 'Not Started' });
  };

  const exportToPDF = (agenda) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 20;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Minutes of Meeting', 105, y, { align: 'center' });

    pdf.setFontSize(12);
    y += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Meeting Title: ${agenda.meetingTitle}`, 10, y);
    y += 7;
    pdf.text(`Date: ${agenda.meetingDate}    Time: ${agenda.meetingTime}`, 10, y);
    y += 7;
    pdf.text(`Type: ${agenda.meetingType}    Priority: ${agenda.priority}`, 10, y);
    y += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Attendees:', 10, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
    pdf.text(agenda.attendees.join(', '), 10, y);
    y += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Agenda Items:', 10, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
    agenda.agendaItems.forEach((item, i) => {
      pdf.text(`${i + 1}. ${item.topic} (${item.duration} mins)`, 10, y);
      y += 6;
    });
    y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Meeting Notes:', 10, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
    const notes = pdf.splitTextToSize(agenda.notes, 180);
    pdf.text(notes, 10, y);
    y += notes.length * 6 + 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Follow-up Actions:', 10, y);
    pdf.setFont('helvetica', 'normal');
    y += 6;
    agenda.followUpActions.forEach((action, i) => {
      pdf.text(`${i + 1}. ${action.task} - [${action.status}]`, 10, y);
      y += 6;
    });

    pdf.save(`${agenda.meetingTitle}_MoM.pdf`);
  };

  const deleteAgenda = (indexToDelete) => {
    const updated = agendas.filter((_, index) => index !== indexToDelete);
    setAgendas(updated);
    setFilteredAgendas(updated);
    localStorage.setItem('agendas', JSON.stringify(updated));
    toast.info('Agenda deleted.');
  };

  const addAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData(prev => ({ ...prev, attendees: [...prev.attendees, attendeeInput.trim()] }));
      setAttendeeInput('');
    }
  };

  const removeAttendee = (index) => {
    const updated = formData.attendees.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, attendees: updated }));
  };

  const addAgendaItem = () => {
    if (agendaInput.topic.trim() && agendaInput.duration.trim()) {
      setFormData(prev => ({ ...prev, agendaItems: [...prev.agendaItems, agendaInput] }));
      setAgendaInput({ topic: '', duration: '' });
    }
  };

  const removeAgendaItem = (index) => {
    const updated = formData.agendaItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, agendaItems: updated }));
  };

  const addFollowUpAction = () => {
    if (actionInput.task.trim()) {
      setFormData(prev => ({ ...prev, followUpActions: [...prev.followUpActions, actionInput] }));
      setActionInput({ task: '', status: 'Not Started' });
    }
  };

  const removeFollowUpAction = (index) => {
    const updated = formData.followUpActions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, followUpActions: updated }));
  };

  const totalDuration = formData.agendaItems.reduce((total, item) => total + parseInt(item.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-slate-800 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold text-emerald-300">Meeting Agenda</h1>

          <input name="meetingTitle" value={formData.meetingTitle} onChange={handleChange} placeholder="Meeting Title" className="w-full px-4 py-2 bg-slate-700 rounded-md" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleChange} className="w-full px-4 py-2 bg-slate-700 rounded-md" required />
            <input type="time" name="meetingTime" value={formData.meetingTime} onChange={handleChange} className="w-full px-4 py-2 bg-slate-700 rounded-md" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full px-4 py-2 bg-slate-700 rounded-md">
              <option value="">Select Meeting Type</option>
              <option value="Standup">Standup</option>
              <option value="Client Call">Client Call</option>
              <option value="Weekly Sync">Weekly Sync</option>
              <option value="Project Kickoff">Project Kickoff</option>
            </select>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 bg-slate-700 rounded-md">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Attendees */}
          <div>
            <label className="block mb-1">Attendees</label>
            <div className="flex gap-2">
              <input value={attendeeInput} onChange={(e) => setAttendeeInput(e.target.value)} placeholder="Add attendee" className="flex-1 px-4 py-2 bg-slate-700 rounded-md" />
              <button type="button" onClick={addAttendee} className="bg-emerald-600 px-4 py-2 rounded-md">Add</button>
            </div>
            <ul className="mt-2 text-sm text-emerald-300 space-y-1">
              {formData.attendees.map((a, i) => (
                <li key={i} className="flex justify-between">{a}<button onClick={() => removeAttendee(i)} className="text-red-400">Remove</button></li>
              ))}
            </ul>
          </div>

          {/* Agenda Items */}
          <div>
            <label className="block mb-1">Agenda Items</label>
            <div className="grid grid-cols-2 gap-2">
              <input value={agendaInput.topic} onChange={(e) => setAgendaInput({ ...agendaInput, topic: e.target.value })} placeholder="Topic" className="px-4 py-2 bg-slate-700 rounded-md" />
              <input type="number" value={agendaInput.duration} onChange={(e) => setAgendaInput({ ...agendaInput, duration: e.target.value })} placeholder="Duration (mins)" className="px-4 py-2 bg-slate-700 rounded-md" />
            </div>
            <button type="button" onClick={addAgendaItem} className="mt-2 bg-emerald-600 px-4 py-2 rounded-md">Add Item</button>
            <ul className="mt-2 text-sm text-emerald-300 space-y-1">
              {formData.agendaItems.map((item, i) => (
                <li key={i} className="flex justify-between">{item.topic} ({item.duration} mins) <button onClick={() => removeAgendaItem(i)} className="text-red-400">Remove</button></li>
              ))}
            </ul>
            <p className="mt-2 text-emerald-400">Total Estimated Time: {totalDuration} mins</p>
          </div>

          {/* Notes */}
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Meeting notes..." rows={4} className="w-full px-4 py-2 bg-slate-700 rounded-md" />

          {/* Follow-Up Actions */}
          <div>
            <label className="block mb-1">Follow-up Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <input value={actionInput.task} onChange={(e) => setActionInput({ ...actionInput, task: e.target.value })} placeholder="Task" className="px-4 py-2 bg-slate-700 rounded-md" />
              <select value={actionInput.status} onChange={(e) => setActionInput({ ...actionInput, status: e.target.value })} className="px-4 py-2 bg-slate-700 rounded-md">
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <button type="button" onClick={addFollowUpAction} className="mt-2 bg-emerald-600 px-4 py-2 rounded-md">Add Action</button>
            <ul className="mt-2 text-sm text-emerald-300 space-y-1">
              {formData.followUpActions.map((item, i) => (
                <li key={i} className="flex justify-between">{item.task} - [{item.status}] <button onClick={() => removeFollowUpAction(i)} className="text-red-400">Remove</button></li>
              ))}
            </ul>
          </div>

          <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-white rounded-md font-semibold shadow">Save Agenda</button>
        </form>

        {/* Saved agendas */}
        <div className="mt-10">
          <input type="text" placeholder="Search agendas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full mb-4 px-4 py-2 bg-slate-700 rounded-md" />
          <h2 className="text-2xl font-semibold text-emerald-200 mb-4">Saved Agendas</h2>
          {filteredAgendas.length === 0 ? (
            <p className="text-emerald-300">No agendas found.</p>
          ) : (
            filteredAgendas.map((agenda, index) => (
              <div key={index} className="mb-6 p-4 rounded-lg bg-slate-700 shadow">
                <h3 className="text-xl font-semibold text-emerald-200">{agenda.meetingTitle}</h3>
                <p className="text-sm text-emerald-300">{agenda.meetingDate} at {agenda.meetingTime} ({agenda.meetingType}) | Priority: {agenda.priority}</p>
                <p className="text-sm mt-1">Attendees: {(Array.isArray(agenda.attendees) ? agenda.attendees : []).join(', ')}</p>
                <div className="flex gap-4 mt-3">
                  <button onClick={() => exportToPDF(agenda)} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">Export PDF</button>
                  <button onClick={() => deleteAgenda(index)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
