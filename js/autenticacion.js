import { auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js'; // Importamos todo desde firebase-config.js

const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const signUpLink = document.getElementById('sign-up-link');
const registro = document.getElementById('registro');


const adminEmail = "admin@example1.com"; 

onAuthStateChanged(auth, (user) => {
	if (user) {
		const userEmail = user.email || "Usuario no identificado";
		console.log(userEmail);
		userInfo.textContent = `Usuario: ${userEmail}`;
		logoutBtn.style.display = 'block';
		loginForm.style.display = 'none';
		registro.style.display = 'none';

		if (user.email === adminEmail) {
            window.location.href = './admin.html'; 
        } 

	} else {
		userInfo.textContent = '';
		logoutBtn.style.display = 'none';
		loginForm.style.display = 'block';
		registro.style.display = 'block';
	}
});

loginForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			Swal.fire({
				title: 'Sesión iniciada',
				text: `Bienvenido, ${userCredential.user.email}!`,
				icon: 'success',
				confirmButtonText: 'Ok'
			});
		})
		.catch((error) => {
			Swal.fire({
				title: 'Error',
				text: 'Error al iniciar sesión: ' + error.message,
				icon: 'error',
				confirmButtonText: 'Ok'
			});
		});
});

signUpLink.addEventListener('click', () => {
	Swal.fire({
		title: 'Registro',
		html: `
			<input type="email" id="swal-input1" class="swal2-input" placeholder="Correo electrónico">
			<input type="password" id="swal-input2" class="swal2-input" placeholder="Contraseña">
		`,
		showCancelButton: true,
		confirmButtonText: 'Registrar',
		cancelButtonText: 'Cancelar',
		preConfirm: () => {
			const email = document.getElementById('swal-input1').value;
			const password = document.getElementById('swal-input2').value;
			if (!email || !password) {
				Swal.showValidationMessage('Por favor ingresa ambos campos');
			}
			return { email, password };
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const { email, password } = result.value;
			createUserWithEmailAndPassword(auth, email, password)
				.then((userCredential) => {
					Swal.fire({
						title: 'Registro exitoso',
						text: 'Ahora puedes iniciar sesión.',
						icon: 'success',
						confirmButtonText: 'Ok'
					});
				})
				.catch((error) => {
					Swal.fire({
						title: 'Error',
						text: 'Error al registrarte: ' + error.message,
						icon: 'error',
						confirmButtonText: 'Ok'
					});
				});
		}
	});
});



// Cerrar sesión
logoutBtn.addEventListener('click', () => {
	Swal.fire({
		title: '¿Estás seguro?',
		text: '¿Deseas cerrar sesión?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí',
		cancelButtonText: 'No'
	}).then((result) => {
		if (result.isConfirmed) {
			signOut(auth)
				.then(() => {
					Toastify({
						text: "Has cerrado sesión",
						duration: 3000,
						close: true,
						gravity: "top",
						position: "right",
						stopOnFocus: true,
						style: {
							background: "linear-gradient(to right, #2F579C, #617ebd)",
							borderRadius: "2rem",
							textTransform: "uppercase",
							fontSize: ".75rem"
						}
					}).showToast();
				})
				.catch((error) => {
					console.error('Error al cerrar sesión:', error.message);
				});
		}
	});
});
