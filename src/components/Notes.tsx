import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category?: string;
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: '' });
  const { t } = useLanguage();

  useEffect(() => {
    const savedNotes = localStorage.getItem('finance-notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('finance-notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title.trim() || t('untitled'),
        content: newNote.content.trim(),
        date: new Date().toISOString(),
        category: newNote.category.trim() || undefined,
      };
      setNotes((prev) => [note, ...prev]);
      setNewNote({ title: '', content: '', category: '' });
      setIsAdding(false);
    }
  };

  const handleEditNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)));
    setEditingId(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" aria-hidden="true" />
            {t('notes')}
          </CardTitle>
           <CardDescription>Manage your financial notes and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)} className="w-80% flex items-center">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Note
            </Button>
          ) : (
            <div className="space-y-4">
              
              <Input
                placeholder='Note Title'
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                aria-label={t('noteTitle')}
              />
              <Input
                placeholder='Category (optional)'
                value={newNote.category}
                onChange={(e) => setNewNote((prev) => ({ ...prev, category: e.target.value }))}
                aria-label={t('categoryOptional')}
              />
              <Textarea
                placeholder='Note Content'
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                rows={4}
                aria-label={t('noteContent')}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddNote}>
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('save')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewNote({ title: '', content: '', category: '' });
                  }}
                >
                  <X className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="text-lg font-medium mb-2">{t('noNotes')}</p>
           <p className="text-muted-foreground">Start by adding your first note</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === note.id ? (
                      <Input
                        defaultValue={note.title}
                        onBlur={(e) => handleEditNote(note.id, { title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditNote(note.id, { title: e.currentTarget.value })}
                        autoFocus
                        aria-label={t('editNoteTitle')}
                      />
                    ) : (
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{formatDate(note.date)}</Badge>
                      {note.category && <Badge variant="outline">{note.category}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === note.id ? null : note.id)}
                      aria-label={t('editNote')}
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label={t('deleteNote')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === note.id ? (
                  <Textarea
                    defaultValue={note.content}
                    onBlur={(e) => handleEditNote(note.id, { content: e.target.value })}
                    rows={4}
                    aria-label={t('editNoteContent')}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{note.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
