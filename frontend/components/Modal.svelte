<script>
    export let showModal;
    export let title = "Modal Title";
    export let fields = [];
    export let submitButtonLabel = "Submit";
    export let onSubmit;
    export let initialValues = {};
    let formData = {};
  
    // Pre-fill form data if initialValues are provided
    formData = { ...initialValues };

    function handleSubmit() {
        // When submitting the form, send the data to the parent onSubmit function.
        if (onSubmit) {
            onSubmit(formData);
        }
        showModal = false;
    }

    // Close modal on clicking the overlay
    function closeModal() {
        formData = {};
        showModal = false;
    }
  </script>

{#if showModal}
    <div class="modal-overlay" on:click={closeModal}></div>
    <div class="modal-content login">
    <h2>{title}</h2>
        <form on:submit={handleSubmit}>
            {#each fields as field}
                <input type="text" placeholder={field} bind:value={formData[field]} required />
            {/each}
            <button type="submit" class="submit">{submitButtonLabel}</button>
        </form>
    <button class="close-button" on:click={closeModal}>Close</button>
    </div>
{/if}