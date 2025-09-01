-- Test d'envoi du dernier lead vers Loops via edge function
SELECT pg_notify('loops_test', 'Envoi du lead: hardwiredtechnologies.in@gmail.com');