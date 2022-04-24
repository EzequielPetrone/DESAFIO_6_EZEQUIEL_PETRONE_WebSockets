# DESAFIO_6_EZEQUIEL_PETRONE_WebSockets


Lo que hice fue que el server informe de a un producto / mensaje tiro a tiro.

Entiendo que es más fácil en cada comunicación informar el array entero...

Eso conlleva menos lógica del lado del cliente ya que podría renderizar la tabla de cero cada vez (por ejemplo resolves todo con el template de hbs directo)

Pero me da la sensación que es poco performante cuando el array es grande. 

Por eso decidí ir agregando de a uno (aunque conlleve un poquito más de lógica en el front)


Lo que me pareció piola de lo que hice es la gestión del lado del cliente en caso que haya una caída del server (y una posterior reconexión). 

