import { auth, firestore } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import User from './user.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid@8.3.2'; // Importando desde JSPM

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');
    userNameSpan.textContent = localStorage.getItem('user_name');

    loadPrescriptions();
});

function showCreatePrescriptionForm() {
    document.getElementById('create-prescription-form').style.display = 'block';
}

async function createPrescription() {
    const patientName = document.getElementById('patient-name').value;
    const medicationName = document.getElementById('medication-name').value;
    const dosis = document.getElementById('dosis').value;
    const doctorId = localStorage.getItem('user_id');
    const doctorName = localStorage.getItem('user_name');
    const date = new Date().toISOString();

    // Buscar el ID del paciente en Firestore
    const patientsCollection = collection(firestore, 'patients');
    const q = query(patientsCollection, where('name', '==', patientName));
    const patientSnapshot = await getDocs(q);

    if (patientSnapshot.empty) {
        alert('Paciente no encontrado');
        return;
    }

    const patientId = patientSnapshot.docs[0].id;

    // Crear receta
    const prescriptionRef = collection(firestore, 'prescriptions');
    const newPrescription = {
        patientId,
        patientName,
        patientDni: '',
        doctorId,
        doctorName,
        medicationName,
        dosis,
        status: true,
        date
    };

    try {
        await addDoc(prescriptionRef, newPrescription);
        alert('Receta creada exitosamente');
        loadPrescriptions();
    } catch (e) {
        console.error('Error al crear la receta:', e);
    }
}

async function loadPrescriptions() {
    try {
        const querySnapshot = await getDocs(collection(firestore, 'prescriptions'));
        const prescriptionListDiv = document.getElementById('prescription-list');
        prescriptionListDiv.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const prescription = doc.data();
            const prescriptionElement = document.createElement('div');
            prescriptionElement.className = 'prescription-item';
            prescriptionElement.innerHTML = `
                <p>Paciente: ${prescription.patientName}</p>
                <p>Medicamento: ${prescription.medicationName}</p>
                <p>Fecha: ${prescription.date}</p>
                <button onclick="editPrescription('${doc.id}')">Editar receta</button>
                <button onclick="deletePrescription('${doc.id}')">Eliminar receta</button>
            `;
            prescriptionListDiv.appendChild(prescriptionElement);
        });
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

async function editPrescription(prescriptionId) {
    // Implementar lógica para editar la receta
}

async function deletePrescription(prescriptionId) {
    // Implementar lógica para eliminar la receta
}

function signOutUser() {
    auth.signOut().then(() => {
        localStorage.removeItem('user_name');
        localStorage.removeItem('id_token');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    });
}