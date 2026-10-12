import { useState } from "react";
import { SearchPill } from "../../components/SearchPill";
import { formatDateRange, formatGuests } from "../../lib/format";
import { SearchEditor } from "./SearchEditor";
import { useStaySearchParams } from "./useStaySearchParams";

// The header's search pill plus its where/when/who editor.
export function HeaderSearch() {
  const { query, setQuery } = useStaySearchParams();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchPill
        where={query.city ?? "Anywhere"}
        when={
          query.checkIn && query.checkOut
            ? formatDateRange(query.checkIn, query.checkOut)
            : "Any week"
        }
        who={formatGuests(query.guests)}
        onClick={() => {
          setOpen(true);
        }}
      />
      {open && (
        <SearchEditor
          query={query}
          onSearch={setQuery}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
