import { TextInput, ActionIcon } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useInputState } from "@mantine/hooks";

const SearchBar = ({ onSearch, initialValue = "" }) => {
  const [value, setValue] = useInputState(initialValue);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <TextInput
        placeholder="Search products..."
        value={value}
        onChange={setValue}
        rightSection={
          value ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleClear}
              aria-label="Clear search"
              type="button"
            >
              <IconX size={16} />
            </ActionIcon>
          ) : (
            <IconSearch size={18} style={{ color: "var(--mantine-color-gray-5)" }} />
          )
        }
        styles={{
          input: {
            width: "100%",
            fontSize: "var(--mantine-font-size-sm)",
          },
        }}
      />
    </form>
  );
};

export default SearchBar;