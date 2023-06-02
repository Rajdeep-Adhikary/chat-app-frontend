const socket = io.connect('https://chat-server-xy1s.onrender.com/chat');

let content = document.getElementById('messages');
let message_form = document.getElementById('message-form');
let message_input = document.getElementById('message-input');
let room_input = document.getElementById('room-input');
let room_name_form = document.getElementById("room-name-form");
let room_name_input = document.getElementById('room-name');
let user_name_input = document.getElementById('user-name');
let user_greeting_div = document.getElementById('user-greeting');
let leave_btn = document.getElementById('leave-btn');
let user_list = document.getElementById('user_list');
let sidebar = document.getElementById('sidebar');
let room = user = '';

message_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = message_input.value;
    if(message == '')
        return false;
    message_input.value = '';
    add_message(create_message(message));

    socket.emit('send-message', user, message, room);
})

const create_message = message => {
    const div = document.createElement('div');
    div.innerHTML = `You : ${message}`;
    div.classList.add('single-message');
    return div;
}

const create_other_message = (user, message) => {
    const div = document.createElement('div');
    div.innerHTML = `${user} : ${message}`;
    div.classList.add('single-message');
    return div;
}

const add_message = msgdiv => {
    let msgcont = document.createElement('div');
    msgcont.appendChild(msgdiv);
    msgcont.classList.add('d-flex');
    msgcont.classList.add('justify-content-end');
    content.appendChild(msgcont);
    scroll_to_bottom();
}

const add_other_message = msgdiv => {
    let msgcont = document.createElement('div');
    msgcont.appendChild(msgdiv);
    msgcont.classList.add('d-flex');
    msgcont.classList.add('justify-content-start');
    content.appendChild(msgcont);
    scroll_to_bottom();
}

socket.on('send-to-other', (user, message) => {
    $(`.${user}-typing`).remove();
    add_other_message(create_other_message(user, message));
})

socket.on('user-joined', (user) => {
    display_joined(`${user} has joined to this room`);
    scroll_to_bottom();
})

socket.on('update-user-list', (users) => {
    update_user_list(users);
})

socket.on('user-left', user => {
    display_joined(`${user} has left this room`);
    scroll_to_bottom();
})



room_name_form.addEventListener('submit', e => {
    e.preventDefault();
    room = room_name_input.value;
    user = user_name_input.value;

    socket.emit('join-room', room, user, ({message, error}) => {
        if(error){
            alert(error);
            return false;
        }
        console.log(error);
        console.log(message);
        display_joined(message);
        toggle_view();
        greet_user();
    })
    
})

const toggle_view = function(){
    $('#welcome-window').hide();
    $('#chat-window').show();
}


const display_joined = message => {
    const div = document.createElement('div');
    div.classList.add('notification');
    div.innerHTML = message;
    content.appendChild(div);
}

const scroll_to_bottom = () => {
    content.scrollTo({left : 0, top : content.scrollHeight, behavior : 'smooth'});
}

const greet_user = () => {
    user_greeting_div.innerHTML = `Hi ${user}`;
}

leave_btn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('leave-room', room, user, () => {
        location.reload();
    })
})


const update_user_list = clients => {
    if(clients.length > 0){
        user_list.innerHTML = '';
        clients.forEach(client => {
            const liUser = document.createElement('li');
            liUser.innerHTML = client;
            user_list.appendChild(liUser);
        });
    }
}

$(document).on('input', '#message-input', function(){
    socket.emit('user-typing', user, room);
})

socket.on('user-typing-show', (user) => {
    display_user_typing(user);
})

const display_user_typing = (user) => {
    $(`.${user}-typing`).remove();

    const div = document.createElement('div');
    div.innerHTML = `<img src='typing.gif' class='typing-gif'> ${user} is typing`;
    div.classList.add('single-message');
    

    let msgcont = document.createElement('div');
    msgcont.appendChild(div);
    msgcont.classList.add('d-flex');
    msgcont.classList.add('justify-content-start');
    msgcont.classList.add(`${user}-typing`);
    content.appendChild(msgcont);
    scroll_to_bottom();
} 

$(document).on('click', '.sidebar-icon', () => {
    toggle_sidebar();
})

const toggle_sidebar = () => {
    if(sidebar.style.display === 'none'){
        $('#sidebar').show("slide", {direction: "left" }, 500);
    }
    else{
        $('#sidebar').hide("slide", {direction: "left" }, 500);
    }
}