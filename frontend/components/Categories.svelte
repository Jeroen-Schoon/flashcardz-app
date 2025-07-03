<script>
    import Category from "./Category.svelte";
    import Flashcards from "./Flashcards.svelte";
    import Modal from "./Modal.svelte";

    export let categories;
    export let userId;
    export let refreshCategories;
    export let showFlashcards = false;
    export let selectedCategory = null;

    let showModal = false;

    // Opens the modal for adding a new category
    function openAddCategoryModal() {
        showModal = true;
    }

    // Adds a new category to the database
    async function addCategory(formData) {
        try {
            const response = await fetch(`/user/${userId}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryName: formData["Category Name"] }),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to add category');
            }

            const data = await response.json();

            // Call the refreshCategories function to update the categories
            if (refreshCategories) {
                refreshCategories(userId); // Pass userId to refresh categories
            }

        } catch (error) {
            console.error('Error:', error.message);
        }
    }
</script>

<!-- Show all categories -->
{#if !showFlashcards}
    <h1>Categories</h1>
    <div class="categories centered">
        <!-- Display each category -->
        {#each categories as category}
            <Category bind:category={category} bind:showFlashcards={showFlashcards} bind:selectedCategory={selectedCategory} bind:userId={userId} refreshCategories={refreshCategories} />
        {/each}
        <button class="category" on:click="{openAddCategoryModal}">
            <h3 class="large">+</h3>
        </button>
    </div>

    <!-- Modal for adding new categories -->
    <Modal
        bind:showModal={showModal}
        title="Add New Category"
        fields={['Category Name']}
        submitButtonLabel="Add Category"
        onSubmit={addCategory}
    />
{:else}
    <!-- Show the flashcards of the selected category -->
    <Flashcards bind:category={selectedCategory} bind:userId={userId} bind:showFlashcards={showFlashcards} />
{/if}